import { readJSONFile } from "./file.js";

class Brands {
    private static instance: Brands;
    private _brands: [];

    private constructor() {
        this._brands = readJSONFile('./data/mobileBrands.json').brands;
    }

    public static get(): string[] {
        if (!Brands.instance) {
            Brands.instance = new Brands();
        }
        return Brands.instance.getBrands();
    }

    private getBrands() {
        return this._brands;
    }
}

export default Brands;
