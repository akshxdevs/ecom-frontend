"use client";
import { Products} from "./Products";
import { ProductsAppBar } from "./ProductsAppBar";

export const Main = () => {

  return (
    <div className="p-16">
      <ProductsAppBar/>
      <Products />
    </div>
  );
};
