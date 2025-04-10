import { postAtom } from "@/State/Post/post";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useRecoilState, useRecoilValue } from "recoil";
import { debounce } from "lodash";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { useNavigate } from "react-router-dom";
import { userAtom } from "@/State/Post/user/user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function CreateBlog() {
  const navigate = useNavigate();
  const [pubLoading, setpubLoading] = useState(false);
  const [postInput, setpostInput] = useRecoilState(postAtom);
  const [error, setError] = useState("");
  // const [loading, setLoading] = useState(false);
  // const [loadingcomplete, setloadingcomplete] = useState(false);
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    if (!user.id) {
      navigate("/signin");
    }
  }, []);

  useEffect(() => {
    setpostInput({
      title: "",
      content: "",
      // imagelink: "",
    });
  }, []);

  const HandleContentChange = debounce((value: string) => {
    setpostInput((prev) => {
      return { ...prev, content: value };
    });
  }, 1000);

  const HandleTitleChange = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setpostInput((prev) => {
        return { ...prev, title: e.target.value };
      });
    },
    1000
  );


  const HandlePublish = async () => {
    setpubLoading(true);
    try {
      if (!postInput.title || !postInput.content ) {
        setError("Please fill all the fields");
        return;
      }
      const res = await axios.post(`${BACKEND_URL}/api/v1/blog`, postInput, {
        headers: {
          jwt: localStorage.getItem("jwt"),
        },
      });
      console.log(res);
      setpubLoading(false);
      navigate(`/blog/:${res.data.id}`);
    } catch (error) {
      setError("Something went wrong");
      setpubLoading(false);
    }
  };

  return (
    <div className="flex justify-center pt-[20px] font-roboto">
      <div className="md:w-[600px] w-[90vw] flex flex-col items-center">
        {error && (
          <div className="w-full mb-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        <h1 className="font-extrabold text-4xl my-2">Create Blog</h1>
        <div className="flex w-full my-2">
          <Input
            onClick={() => {
              setError("");
            }}
            onChange={HandleTitleChange}
            placeholder="Title"
            className="w-full"
          />
          <Button
            onClick={HandlePublish}
            className="ml-2 hover:border-black hover:bg-black hover:text-white text-black border-2 border-black bg-white"
          >
            {pubLoading?<Spinner/>:"Publish"}
          </Button>
        </div>
        {/* <div className="flex w-full mb-2">
          <Input
            onClick={() => {
              setError("");
            }}
            onChange={HandleImageUpload}
            id="picture"
            className="cursor-pointer"
            type="file"
          />
          <Button
            onClick={() => {
              setuploadImage(true);
            }}
            className="ml-2 w-[120px] hover:text-black hover:border-black border-2 border-black hover:bg-white"
          >
            {loading ? <Spinner /> : "Upload Picture"}
          </Button>
        </div>
        <div className="mb-2">
          {loadingcomplete && (
            <img
              src={postInput.imagelink}
              alt="image"
              className="border-black border-4  h-[300px]"
            />
          )}
        </div> */}
        <div
          onClick={() => {
            setError("");
          }}
          className="w-full"
        >
          <ReactQuill
            className="w-full h-[300px] mb-[20px] "
            theme="snow"
            onChange={HandleContentChange}
          />
        </div>
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="h-screen hover:invert w-[120px] flex justify-center items-center">
      <div className="animate-spin rounded-full h-[25px] w-[25px] border-t-2 border-b-2 border-white "></div>
    </div>
  );
}
