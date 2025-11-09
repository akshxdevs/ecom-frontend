"use client";
import { Products} from "./Products";
import { ProductsAppBar } from "./ProductsAppBar";

export const MainPage = () => {

  return (
    <div className="px-16 py-4">
      <ProductsAppBar/>
      <Products />
    </div>
  );
};
