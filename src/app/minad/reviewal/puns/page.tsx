import { fetchQuery } from "convex/nextjs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "../../../../../convex/_generated/api";

import { Action } from "./_components/action";

export default async function Page() {
  const puns = await fetchQuery(api.puns.getQueuedPuns);

  return (
    <div>
      <div className="my-8">
        <h1 className="text-xl font-bold">말장난 검수 테이블</h1>
      </div>

      <div>
        <Table className="border ">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] font-semibold border-r">
                첫번째 행
              </TableHead>
              <TableHead className="w-[200px] font-semibold border-r">
                두번째 행
              </TableHead>
              <TableHead className="w-[80px] font-semibold border-r">
                상태
              </TableHead>
              <TableHead className="w-[60px] text-right font-semibold border-r">
                붐업
              </TableHead>
              <TableHead className="w-[60px] text-right font-semibold border-r">
                신고
              </TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {puns.map((p) => (
              <TableRow key={p._id}>
                <TableCell className="font-medium border-r">
                  {p.firstRow}
                </TableCell>
                <TableCell className="font-medium border-r">
                  {p.secondRow}
                </TableCell>
                <TableCell className="text-right border-r">
                  {p.status}
                </TableCell>
                <TableCell className="text-right border-r">
                  {p.likeCount}
                </TableCell>
                <TableCell className="text-right border-r">
                  {p.reportCount}
                </TableCell>
                <TableCell className="text-right">
                  <Action id={p._id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
