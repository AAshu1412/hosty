const {User, UserBuilds} = require("../models/user-model");
const axios = require('axios');
const prisma = require('../utils/db-psql');

const jenkins_webhook = async (req, res) => {
  try {
    const { build, status, user, user_id, email, hosted_site_url, repo_url, branch, subDirectory } = req.body;
    
    console.log("\n\n##########################Webhook received##########################\n\n");
    console.log("Build: " + build);
    console.log("Status: " + status);
    console.log("User: " + user);
    console.log("User ID: " + user_id);
    console.log("Hosted Site URL: " + hosted_site_url);
    console.log("\n\n########################################################\n\n");

    let normalizedStatus = status?.toLowerCase() || 'pending';
    if (normalizedStatus === 'failure') {
        normalizedStatus = 'failed';
    }

    const buildNum = parseInt(build, 10);

    const userData = await prisma.user.findUnique({ 
        where: { githubId: BigInt(user_id) } 
    });

    if (!userData) {
      return res.status(404).json({ status_response: 404, message: 'User not found' });
    }

    // 2. Find the specific repository AND check if this specific build number already exists
    const repo = await prisma.deployedRepo.findFirst({
        where: {
            userId: userData.id,
            repoUrl: repo_url,
            branch: branch
        },
        include: {
            // Only fetch the build that matches the current webhook build number
            builds: {
                where: { buildNumber: buildNum }
            }
        }
    });

    // 3. Update or Create logic
    if (repo) {
        // Check if the build array returned a result
        const buildAlreadyExists = repo.builds && repo.builds.length > 0;

        await prisma.deployedRepo.update({
            where: { id: repo.id },
            data: {
                currentStatus: normalizedStatus,
                hostedSiteUrl: hosted_site_url || repo.hostedSiteUrl,
                currentBuildNumber: buildNum,
                
                // Nested Write: Update the existing build if it's there, otherwise create it!
                builds: buildAlreadyExists 
                  ? {
                      updateMany: {
                          where: { buildNumber: buildNum },
                          data: { status: normalizedStatus }
                      }
                    }
                  : {
                      create: {
                          buildNumber: buildNum,
                          status: normalizedStatus
                      }
                    }
            }
        });
    } else {
        // If repo doesn't exist at all (e.g., triggered manually from Jenkins): Create the Repo AND the first build log
        await prisma.deployedRepo.create({
            data: {
                userId: userData.id,
                repoUrl: repo_url,
                branch: branch,
                subDirectory: subDirectory || null,
                notificationEmail: email || null,
                hostedSiteUrl: hosted_site_url || "",
                currentStatus: normalizedStatus,
                currentBuildNumber: buildNum,
                builds: {
                    create: {
                        buildNumber: buildNum,
                        status: normalizedStatus
                    }
                }
            }
        });
    }

    console.log(`✅ Webhook processed: Build ${build} → ${normalizedStatus}`);

    res.status(200).json({ 
      status_response: 200, 
      message: 'Webhook processed successfully',
      data: { 
        build: buildNum, 
        status: normalizedStatus, 
        repo_url, 
        hosted_site_url,
      } 
    });

  } catch (error) {
    console.error('❌ Webhook Error:', error);
    res.status(500).json({ 
      status_response: 500, 
      error: error.message 
    });
  }
};
module.exports = { jenkins_webhook };