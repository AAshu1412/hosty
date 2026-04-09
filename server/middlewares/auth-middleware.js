const jwt = require("jsonwebtoken");
const { User } = require("../models/user-model");
const prisma = require('../utils/db-psql');

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ msg: "Unauthorization HTTP, Token not provided" });
  }

  const jwtToken = token.replace("Bearer", "").trim();
  console.log("\n\n########## *******Token form auth middleware******* ##############\n\n");
  console.log("Token from auth middleware : " + jwtToken);

  try {
    const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    console.log("Decoded JWT Payload:", isVerified);

    // Prisma: Find the user AND join their deployed repos
    const userData = await prisma.user.findFirst({
      where: {
        id: isVerified.userID,
        githubUsername: isVerified.username,
      },
      include: {
        repos: {
          include: {
            builds: {
              orderBy: { createdAt: 'asc' } // Optional: keeps them in chronological order
            }
          }
        }
      }
    });

    if (!userData) {
      return res.status(401).json({ message: "Unauthorized: User not found." });
    }

    console.log("Data after verifying:", userData);

    // Map the flat Postgres data back to the structure the rest of your app expects
    req.user = {
      username: userData.githubUsername,
      id: userData.githubId.toString(),
      node_id: userData.nodeId,
      email: userData.email,
      type: userData.accountType,
      name: userData.name,
      user_view_type: userData.userViewType,
      bio: userData.bio,
      location: userData.location,
      notification_email: userData.notificationEmail,
      avatar_url: userData.avatarUrl,
      html_url: userData.htmlUrl,

      // ✅ Map the repos AND rename 'builds' back to 'number_of_builds'
      // Deep Map: Translate Prisma's format back to the exact Mongoose format your frontend expects
      repos: userData.repos.map(repo => {
        return {
          repo_url: repo.repoUrl,
          subDirectory: repo.subDirectory,
          branch: repo.branch,
          email: repo.notificationEmail,
          username: userData.githubUsername, // Grabbed from the parent user object
          id: repo.id,
          _id: repo.id,
          hosted_site_url: repo.hostedSiteUrl,
          status: repo.currentStatus,
          build_number: repo.currentBuildNumber,

          // Convert Prisma's Date objects back to Unix timestamps (numbers)
          created_at: repo.createdAt.getTime(),
          updated_at: repo.updatedAt.getTime(),

          // Map the builds array back to 'number_of_builds'
          number_of_builds: repo.builds.map(build => {
            return {
              build: build.buildNumber, // Frontend expects 'build' instead of 'buildNumber'
              status: build.status,
              created_at: build.createdAt.getTime()
            };
          })
        };
      }),

      _id: userData.id,
      has_completed_onboarding: userData.hasCompletedOnboarding,
    };

    req.token = token;
    req.userID = userData.id;
    req.access_token = userData.accessToken;

    next();
    console.log("\n\n########################################################\n\n");
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token." });
  }
};

module.exports = authMiddleware;