import { blogsAtom } from "@/State/Post/blog/blog";
import { BlogCard } from "@/components/BlogCard";
import {LoadingBlogCard } from "@/components/LoadingBLog";
import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { BlogPost } from "./Blog";

export function Blogs(){
    const [blogs,setBlogs] = useRecoilState(blogsAtom);
    const [loader,setLoader] = useState(false);

    useEffect(() => {
        window.scrollTo({top: 0, left: 0, behavior: "smooth"})
        setLoader(true);
        const fetchBlogs = async () => {
            try{
                const res = await axios.get(`${BACKEND_URL}/api/v1/blog/bulk`,{
                    headers:{
                        jwt:localStorage.getItem("jwt")
                    }
                });
                console.log(res)
                setBlogs(res.data.posts);
                setLoader(false);
            }catch(e){

                console.log(e);
                setLoader(false);

            }
        }
        fetchBlogs();
    },[])


    return (
        loader?<div className="md:w-full flex flex-col items-center gap-10 mt-10">
            <LoadingBlogCard/>
            <LoadingBlogCard/>
            <LoadingBlogCard/>
            <LoadingBlogCard/>

        </div>:<div className="flex flex-col gap-5">
        {blogs?.map((blog:BlogPost)=>{
            return <BlogCard id={blog.id} key={blog.id} authorName={blog.authorName} title={blog.title} content={blog.content} createdAt={blog.createdAt} imagelink={blog.imagelink} authorId={blog.authorId} publisher={blog.publisher}/>
        })}
    </div>
    )
}