"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parseStringPromise } from "xml2js";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";

interface Branch {
  CAB_KODECABANG: string;
  CAB_NAMACABANG: string;
  IP_ADDRESS: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function LoginPage() {
  const [branchList, setBranchList] = useState<Branch[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  // const [username, setUsername] = useState("155");
  // const [password, setPassword] = useState("123");
  // const [username, setUsername] = useState("004");
  // const [password, setPassword] = useState("004");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("44");

  const router = useRouter();

  const { setAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        branch,
        username,
        password,
      });
      // localStorage.setItem("token", response.data.token);
      // console.log("Login success: ", response);

      setAuth(
        response.data.token,
        response.data.user.branch,
        response.data.user.userid
      );
      console.log(
        response.data.token,
        response.data.user.branch,
        response.data.user.userid
      );
      router.push("/");
    } catch (error: any) {
      console.error("Error: ", error.message);
      console.log(branch, username, password);
      const backendMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi Error. Coba lagi!";
      setErrorMessage(backendMessage);
      console.log(backendMessage);
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/branch-list`,
          { responseType: "text" } // force plain text, not JSON
        );

        // parse XML into JS object
        const result = await parseStringPromise(response.data, {
          explicitArray: false,
        });

        // navigate XML tree -> IGR.BRANCH
        const branches = Array.isArray(result.IGR.BRANCH)
          ? result.IGR.BRANCH
          : [result.IGR.BRANCH];

        const allowedCodes = [
          "21",
          "22",
          "26",
          "27",
          "32",
          "33",
          "34",
          "38",
          "43",
          "44",
          "46",
          "47",
          "50",
        ];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filteredBranch = branches.filter((branch: any) =>
          allowedCodes.includes(branch.CAB_KODECABANG)
        );

        setBranchList(filteredBranch);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        const backendMessage =
          error.response?.data?.message ||
          error.message ||
          "Terjadi Error. Coba lagi!";
        setErrorMessage(backendMessage);
        console.log(backendMessage);
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-[url(/images.jpeg)]">
      {/* <Image
                src={"/logo-igr.png"}
                alt="logo indogrosir"
                width={128}
                height={128}
                className="pb-4 -z-10 w-full h-screen absolute"
              /> */}
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold mb-6 text-blue-700 border-b-2 border-red-400 mx-8 text-center">
            Monitoring DSPB
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2 w-full">
                <Label htmlFor="cabang">Cabang</Label>
                <Select onValueChange={setBranch}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {branchList.map((branch, i) => (
                        <SelectItem key={i} value={branch.CAB_KODECABANG}>
                          {branch.CAB_KODECABANG} - {branch.CAB_NAMACABANG}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user">Username</Label>
                <Input
                  id="user"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-700 mt-8">
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2"></CardFooter>
      </Card>
      {errorMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6 text-center ">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Terjadi Error
            </h2>
            {/* <p className="mt-2">message:</p> */}
            <p className="text-gray-700 font-bold">
              {errorMessage.includes("No token")
                ? "Harus Login Terlebih Dahulu"
                : errorMessage}
            </p>
            <p className="text-red-600 font-bold mt-1">Silakan coba lagi!</p>
            {errorMessage.includes("No token") ? (
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => router.push("/login")}
              >
                Login
              </button>
            ) : (
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setErrorMessage("")}
              >
                OK
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
