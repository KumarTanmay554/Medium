import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import { SignupInput } from "@kumartanmay554/medium-common";
import {BACKEND_URL} from "../config"
import axios from "axios";

export const Auth = ({type}:{type:"signup"|"signin"}) => {
    const [postInput,setPostInput] = useState<SignupInput>({
        name: "",
        email: "",
        password: "",
    })
    const navigate = useNavigate();

    async function HandleSignup() {

        try{
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`,postInput);
   
            const jwt = response.data.jwt;
            localStorage.setItem("jwt",jwt);
            setTimeout(()=>{
                navigate("/posts");
            },1000)
;        }catch(e){

            
        }
    }
    async function HandleSignin() {
 
        try{
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`,postInput);

            const jwt = response.data.jwt;
            localStorage.setItem("jwt",jwt);
            setTimeout(()=>{
                navigate("/posts");
            },1000)
;        }catch(e){

            //@ts-ignore

        }
    }
        
    return(
        <div className="h-screen flex justify-center flex-col">
            <div className="flex justify-center">
                <div>
                    <div className="px-10">
                        <div className="text-3xl font-extrabold text-left mt-4">
                            {type === "signup" ? "Create an Account" : "Login to your account"}
                        </div>
                        <div className="text-slate-400">
                            {type === "signup"? "Already have an account?": "Don't have an account?"} 
                            <Link to={type === "signup"? "/signin":"/signup"} className="pl-2 underline ">{type === "signup"?"Login":"SignUp"}</Link> 
                        </div>
                    </div>
                    <div className="">
                        {type === "signup" && (<LabelledInput label="Name" placeholder="Enter your name" type="text" onChange={
                            (e) => {
                                setPostInput({
                                    ...postInput,
                                    name: e.target.value
                                });
                            }}/>
                        )}
                        <LabelledInput label="Email" placeholder="xyz@gmail.com" type="email" onChange={(e)=>{
                            setPostInput({
                                ...postInput,
                                email: e.target.value
                            })
                        }}/>
                        <LabelledInput label="Password" placeholder="" type="password" onChange={(e)=>{
                            setPostInput({
                                ...postInput,
                                password: e.target.value
                            })
                        }}/>
                        <button onClick={type==="signup"?HandleSignup:HandleSignin} type="button" className="mt-4 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">{type === "signup" ? "Sign up" : "Login"}</button>

                    </div>
                </div>
            </div>
        </div>
    )
}
function LabelledInput({
    label,
    placeholder,
    type,
    onChange,
    onClick
  }: {
    label: string;
    placeholder: string;
    type?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onClick?: () => void;
  }) {
    return (
      <div>
        <label className="block mb-2 text-sm font-semibold text-black pt-3" htmlFor={label}>
          {label}
        </label>
        <input
          onChange={onChange}
          className="bg-gray-50  border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          type={type || "text"}
          id={label}
          placeholder={placeholder}
          onClick={onClick}
        />
      </div>
    );
  }