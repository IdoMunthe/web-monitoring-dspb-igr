"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Skeleton from "./components/Skeleton";
import Image from "next/image";
import { parseStringPromise } from "xml2js";
import api from "./api";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

type LogNpb = {
  tgl_proses: string;
  kode_toko: string;
  no_pb: string;
  tgl_pb: string;
  no_dspb: string;
  filename: string;
  jenis_npb: string;
  url_npb: string;
  response: string;
  jml_push_ulang: number;
};

interface tokoList {
  tko_kodeomi: string;
}

interface Branch {
  CAB_KODECABANG: string;
  CAB_NAMACABANG: string;
  IP_ADDRESS: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const formatter = (date: string) => {
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
};

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(new Date().setDate(new Date().getDate() - 5))
  .toISOString()
  .split("T")[0];

export default function Page() {
  const { branch } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loadingToko, setLoadingToko] = useState(false);
  const [kodeTokoList, setKodeTokoList] = useState<tokoList[]>([]);
  const [data, setData] = useState<LogNpb[]>([]);
  const [tglAwal, setTglAwal] = useState(yesterday);
  const [tglAkhir, setTglAkhir] = useState(today);
  const [jenisNpb, setJenisNpb] = useState("All");
  const [statusKirim, setStatusKirim] = useState("All");
  const [kodeToko, setKodeToko] = useState("All");
  const [branchList, setBranchList] = useState<Branch[]>([]);
  const [cabang, setCabang] = useState(branch);
  const [errorMessage, setErrorMessage] = useState("");
  const [branchTitle, setBranchTitle] = useState("")

  const router = useRouter();

  // useEffect(() => {
  //   const savedCabang = localStorage.getItem("cabang");
  //   if (savedCabang) setCabang(savedCabang);
  // }, []);

  useEffect(() => {
    const token = localStorage.getItem("token")
    if(!token) {
      return router.push("/login")
    }
  }, [router])

  useEffect(() => {
    const fetchDataToko = async () => {
      try {
        setLoadingToko(true);
        const response = await api.get(`${BASE_URL}/toko-list`, {
          params: {
            branch,
          },
        });
        setKodeTokoList(response.data.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        const backendMessage =
          error.response?.data?.message ||
          error.message ||
          "Terjadi Error. Coba lagi!";
        setErrorMessage(backendMessage);
        console.log(backendMessage);
        console.error("Error at /toko-list: ", error.message);
      } finally {
        setLoadingToko(false);
      }
    };
    fetchDataToko();
  }, [branch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`${BASE_URL}/log-npb`, {
          params: {
            startDate: formatter(tglAwal),
            endDate: formatter(tglAkhir),
            jenisNpb,
            statusKirim,
            kodeToko,
            branch,
          },
        });
        if (response.data.success) {
          console.log(response.data.data);
          setData(response.data.data);
        } else {
          setErrorMessage(response.data.message);
          console.log(response.data.message);
        }
        console.log(branch);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        const backendMessage =
          error.response?.data?.message ||
          error.message ||
          "Terjadi Error. Coba lagi!";
        setErrorMessage(backendMessage);
        console.log(backendMessage);
        console.error("Error at /log-npb: ", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tglAwal, tglAkhir, jenisNpb, statusKirim, kodeToko, branch]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get(
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

        const branchTitleFilter = filteredBranch.filter(
          (branch: any) => branch.CAB_KODECABANG === branch
        );
        setBranchTitle(branchTitleFilter.CAB_NAMACABANG)
        console.log(branchTitleFilter.CAB_NAMACABANG);
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between ">
        <h1 className="text-3xl font-extrabold mb-6 text-blue-800 border-b-4 border-red-500 inline-block">
          Web Monitoring DSPB IGR {branchTitle}
        </h1>
        <Image
          src={"/logo-igr.png"}
          alt="logo indogrosir"
          width={128}
          height={128}
          className="pb-4"
        />
      </div>

      {/* Cabang */}
      {/* <div className="mb-6 bg-white p-4 rounded-2xl shadow w-[20vw] mx-auto">
        <div className="flex flex-col justify-center">
          <label
            htmlFor="tglAwal"
            className="text-sm font-semibold text-blue-700 mb-1"
          >
            Cabang
          </label>
          <select
            id="cabang"
            value={cabang}
            onChange={(e) => {
              setCabang(e.target.value);
              console.log(e.target.value);
            }} // <-- use cabang state
            className="border border-blue-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {branchList.map((branch, i) => (
              <option key={i} value={branch.CAB_KODECABANG}>
                {branch.CAB_KODECABANG} - {branch.CAB_NAMACABANG}
              </option>
            ))}
          </select>
        </div>
      </div> */}

      {/* Filters */}
      <div className="flex gap-4 mb-2 bg-white p-4 rounded-2xl shadow">
        {/* Cabang */}
        {/* <div className="flex flex-col justify-center flex-[2]">
          <label
            htmlFor="cabang"
            className="text-sm font-semibold text-blue-700 mb-1"
          >
            Cabang
          </label>
          <select
            id="cabang"
            value={cabang}
            onChange={(e) => {
              setCabang(e.target.value);
              // localStorage.setItem("cabang", e.target.value);
              console.log(e.target.value);
            }}
            className="border border-blue-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {branchList.map((branch, i) => (
              <option key={i} value={branch.CAB_KODECABANG}>
                {branch.CAB_KODECABANG} - {branch.CAB_NAMACABANG}
              </option>
            ))}
          </select>
        </div> */}

        {/* Tanggal Awal */}
        <div className="flex flex-col flex-1">
          <label
            htmlFor="tglAwal"
            className="text-sm font-semibold text-blue-700 mb-1"
          >
            Tanggal Proses Awal
          </label>
          <input
            id="tglAwal"
            type="date"
            value={tglAwal}
            // onChange={(e) => setTglAwal(e.target.value)}
            onChange={(e) => {
              const value = e.target.value;
              if (value > tglAkhir) {
                setErrorMessage(
                  "Tanggal Awal tidak boleh lebih besar dari Tanggal Akhir"
                ); // <-- show popup
                return;
              }
              setTglAwal(value);
            }}
            className="border border-blue-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tanggal Akhir */}
        <div className="flex flex-col flex-1">
          <label
            htmlFor="tglAkhir"
            className="text-sm font-semibold text-blue-700 mb-1"
          >
            Tanggal Proses Akhir
          </label>
          <input
            id="tglAkhir"
            type="date"
            value={tglAkhir}
            onChange={(e) => {
              const value = e.target.value;
              console.log(value);
              if (value < tglAwal) {
                setErrorMessage(
                  "Tanggal Akhir tidak boleh lebih kecil dari Tanggal Awal"
                ); // <-- show popup
                return;
              }
              setTglAkhir(value);
            }}
            className="border border-blue-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Jenis NPB */}
        <div className="flex flex-col flex-1">
          <label
            htmlFor="jenisNpb"
            className="text-sm font-semibold text-blue-700 mb-1"
          >
            Jenis NPB
          </label>
          <select
            id="jenisNpb"
            value={jenisNpb}
            onChange={(e) => setJenisNpb(e.target.value)}
            className="border border-blue-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
            <option>DRY</option>
            <option>Voucher</option>
            <option>Buah</option>
            <option>Roti</option>
            <option>POT</option>
          </select>
        </div>

        {/* Status Kirim */}
        <div className="flex flex-col flex-1">
          <label
            htmlFor="statusKirim"
            className="text-sm font-semibold text-blue-700 mb-1"
          >
            Status Kirim
          </label>
          <select
            id="statusKirim"
            value={statusKirim}
            onChange={(e) => setStatusKirim(e.target.value)}
            className="border border-blue-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            <option value="Sukses">Sukses</option>
            <option value="GAGAL">Gagal</option>
          </select>
        </div>

        {/* Kode Toko */}
        <div className="flex flex-col flex-1">
          <label
            htmlFor="kodeToko"
            className="text-sm font-semibold text-blue-700 mb-1"
          >
            Kode Toko
          </label>
          <select
            id="kodeToko"
            value={kodeToko}
            onChange={(e) => setKodeToko(e.target.value)}
            className="border border-blue-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {loadingToko ? (
              <option>Loading...</option>
            ) : (
              <>
                <option>All</option>
                {kodeTokoList.map((toko, index) => (
                  <option key={index}>{toko.tko_kodeomi}</option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <table className="w-full border bg-white rounded-2xl shadow overflow-hidden">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="border p-2">Tanggal Proses</th>
              <th className="border p-2">Kode Toko</th>
              <th className="border p-2">No PB</th>
              <th className="border p-2">Tanggal PB</th>
              <th className="border p-2">No DSPB</th>
              <th className="border p-2">File</th>
              <th className="border p-2">Jenis</th>
              <th className="border p-2">Response</th>
              <th className="border p-2">Push Ulang</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 9 }).map((_, j) => (
                  <td key={j} className="border p-2">
                    <Skeleton className="h-4 w-24" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : data.length === 0 ? (
        <div className="flex w-full h-[70vh] font-bold text-3xl text-red-600 justify-center items-center">
          Tidak ada data
        </div>
      ) : (
        <table className="w-full border bg-white rounded-2xl shadow overflow-hidden">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="border p-2">Tanggal Proses</th>
              <th className="border p-2">Kode Toko</th>
              <th className="border p-2">No PB</th>
              <th className="border p-2">Tanggal PB</th>
              <th className="border p-2">No DSPB</th>
              <th className="border p-2">File</th>
              <th className="border p-2">Jenis</th>
              <th className="border p-2">Response</th>
              <th className="border p-2">Push Ulang</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border p-2">{row.tgl_proses.split("T")[0]}</td>
                <td className="border p-2">{row.kode_toko}</td>
                <td className="border p-2">{row.no_pb}</td>
                <td className="border p-2">{row.tgl_pb.split("T")[0]}</td>
                <td className="border p-2">{row.no_dspb}</td>
                <td className="border p-2">{row.filename}</td>
                <td className="border p-2">{row.jenis_npb}</td>
                <td
                  className={`border p-2 font-semibold ${
                    row.response.includes("SUKSES")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {row.response.includes("SUKSES") ? "Sukses" : "Gagal"}
                </td>
                <td className="border p-2 font-semibold">
                  {row.jml_push_ulang}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {errorMessage &&
        !errorMessage.includes("No token") &&(
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
