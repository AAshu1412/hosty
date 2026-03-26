import { NavLink } from "react-router-dom";
import GithubAuthButton from "./GithubAuthButton";
// import { useAuth } from "../store/auth";

export default function Navbar() {
//   const { isLoggedIn } = useAuth();

  return (
    <nav>
      <div className="h-24 grid grid-cols-[5rem_1fr_4fr_5rem] bg-orange-600">
        <div className="col-start-2 col-span-1 flex flex-row justify-center items-center text-4xl bg-red-600">
          <p>Hosty</p>
        </div>
        <div className="col-start-3 col-span-1 text-xl bg-green-600">
          <ul className="h-24 flex flex-row justify-center pl-96 items-center gap-10 ">
            {/* <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/contact">Contact</NavLink>
            </li> */}
            <li>
              <NavLink to="/about">About</NavLink>
            </li>

              <li>

                <GithubAuthButton/>
              </li>
            

            {/* {isLoggedIn ? (
              <li>
                <NavLink to="/logout">Logout</NavLink>
              </li>
            ) : (
              <>
                <li>
                  <NavLink to="/register">Register</NavLink>
                </li>
                <li>
                  <NavLink to="/login">Login</NavLink>
                </li>
              </>
            )} */}
          </ul>
        </div>
      </div>
    </nav>
  );
}