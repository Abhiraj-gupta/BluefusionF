import { Document } from 'mongoose';
export interface IBiodiversity extends Document {
    decimalLatitude: number;
    decimalLongitude: number;
    date_year: number;
    depth: number;
    family: string;
    familyid: number;
    genus: string;
    genusid: number;
    habitat: string;
    dataset_id: string;
    class: string;
    classid: number;
}
declare const _default: import("mongoose").Model<IBiodiversity, {}, {}, {}, Document<unknown, {}, IBiodiversity, {}, {}> & IBiodiversity & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Biodiversity.d.ts.map