import { Main } from "next/document";
import { Appbar } from "../Components/Appbar";

export default function() {
  return (
    <div>
      <div>
        <Appbar/>
      </div>
      <div>
        <Main/>
      </div>
    </div>
  );
}
