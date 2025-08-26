"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Skeleton from "./components/Skeleton";

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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const formatter = (date: string) => {
  const [year, month, day] = date.split("-");
  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
};

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(new Date().setDate(new Date().getDate() -1)).toISOString().split("T")[0]

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [loadingToko, setLoadingToko] = useState(false);
  const [kodeTokoList, setKodeTokoList] = useState<tokoList[]>([]);
  const [data, setData] = useState<LogNpb[]>([]);
  const [tglAwal, setTglAwal] = useState(yesterday);
  const [tglAkhir, setTglAkhir] = useState(today);
  const [jenisNpb, setJenisNpb] = useState("All");
  const [statusKirim, setStatusKirim] = useState("All");
  const [kodeToko, setKodeToko] = useState("All");

  useEffect(() => {
    console.log(BASE_URL)
    const fetchDataToko = async () => {
      try {
        setLoadingToko(true);
        const response = await axios.get(`${BASE_URL}/toko-list`);
        setKodeTokoList(response.data.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error at /toko-list: ", error.message);
      } finally {
        setLoadingToko(false);
      }
    };
    fetchDataToko();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/log-npb`, {
          params: {
            startDate: formatter(tglAwal),
            endDate: formatter(tglAkhir),
            jenisNpb,
            statusKirim,
            kodeToko,
          },
        });
        setData(response.data.data);
        console.log(response.data.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error at /log-npb: ", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tglAwal, tglAkhir, jenisNpb, statusKirim, kodeToko]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Web Monitoring DSPB IGR.</h1>

      {/* Filters */}
      <div className="flex flex-row gap-4 mb-4">
        {/* Tanggal Awal */}
        <div className="flex flex-col flex-1">
          <label htmlFor="tglAwal">Tanggal Awal</label>
          <input
            id="tglAwal"
            type="date"
            value={tglAwal}
            onChange={(e) => setTglAwal(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Tanggal Akhir */}
        <div className="flex flex-col flex-1">
          <label htmlFor="tglAkhir">Tanggal Akhir</label>
          <input
            id="tglAkhir"
            type="date"
            value={tglAkhir}
            onChange={(e) => setTglAkhir(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Jenis NPB */}
        <div className="flex flex-col flex-1">
          <label htmlFor="jenisNpb">Jenis NPB</label>
          <select
            id="jenisNpb"
            value={jenisNpb}
            onChange={(e) => setJenisNpb(e.target.value)}
            className="border p-2 rounded w-full"
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
          <label htmlFor="statusKirim">Status Kirim</label>
          <select
            id="statusKirim"
            value={statusKirim}
            onChange={(e) => setStatusKirim(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="All">All</option>
            <option value="Sukses">Sukses</option>
            <option value="Gagal">Gagal</option>
          </select>
        </div>

        {/* Kode Toko */}
        <div className="flex flex-col flex-1">
          <label htmlFor="kodeToko">Kode Toko</label>
          <select
            id="kodeToko"
            value={kodeToko}
            onChange={(e) => setKodeToko(e.target.value)}
            className="border p-2 rounded w-full"
          >
            {loadingToko ? (
              <option>loading data...</option>
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
        // skeleton table
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
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
                <td className="border p-2">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="border p-2">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="border p-2">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="border p-2">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="border p-2">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="border p-2">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="border p-2">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="border p-2">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="border p-2">
                  <Skeleton className="h-4 w-16" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : data.length === 0 ? (
        <div className="flex w-[100%] h-[80vh] font-bold text-4xl justify-center items-center">
          Tidak ada data
        </div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
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
              <tr key={index}>
                <td className="border p-2">{row.tgl_proses.split("T")[0]}</td>
                <td className="border p-2">{row.kode_toko}</td>
                <td className="border p-2">{row.no_pb}</td>
                <td className="border p-2">{row.tgl_pb.split("T")[0]}</td>
                <td className="border p-2">{row.no_dspb}</td>
                <td className="border p-2">{row.filename}</td>
                <td className="border p-2">{row.jenis_npb}</td>
                <td className="border p-2">
                  {row.response.includes("SUKSES") ? "Sukses" : "Gagal"}
                </td>
                <td className="border p-2">{row.jml_push_ulang}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
