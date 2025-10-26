import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TemplateModel = runtime.Types.Result.DefaultSelection<Prisma.$TemplatePayload>;
export type AggregateTemplate = {
    _count: TemplateCountAggregateOutputType | null;
    _avg: TemplateAvgAggregateOutputType | null;
    _sum: TemplateSumAggregateOutputType | null;
    _min: TemplateMinAggregateOutputType | null;
    _max: TemplateMaxAggregateOutputType | null;
};
export type TemplateAvgAggregateOutputType = {
    usageCount: number | null;
};
export type TemplateSumAggregateOutputType = {
    usageCount: number | null;
};
export type TemplateMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    thumbnailUrl: string | null;
    publishedAt: Date | null;
    usageCount: number | null;
};
export type TemplateMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    thumbnailUrl: string | null;
    publishedAt: Date | null;
    usageCount: number | null;
};
export type TemplateCountAggregateOutputType = {
    id: number;
    name: number;
    thumbnailUrl: number;
    publishedAt: number;
    usageCount: number;
    _all: number;
};
export type TemplateAvgAggregateInputType = {
    usageCount?: true;
};
export type TemplateSumAggregateInputType = {
    usageCount?: true;
};
export type TemplateMinAggregateInputType = {
    id?: true;
    name?: true;
    thumbnailUrl?: true;
    publishedAt?: true;
    usageCount?: true;
};
export type TemplateMaxAggregateInputType = {
    id?: true;
    name?: true;
    thumbnailUrl?: true;
    publishedAt?: true;
    usageCount?: true;
};
export type TemplateCountAggregateInputType = {
    id?: true;
    name?: true;
    thumbnailUrl?: true;
    publishedAt?: true;
    usageCount?: true;
    _all?: true;
};
export type TemplateAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TemplateWhereInput;
    orderBy?: Prisma.TemplateOrderByWithRelationInput | Prisma.TemplateOrderByWithRelationInput[];
    cursor?: Prisma.TemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TemplateCountAggregateInputType;
    _avg?: TemplateAvgAggregateInputType;
    _sum?: TemplateSumAggregateInputType;
    _min?: TemplateMinAggregateInputType;
    _max?: TemplateMaxAggregateInputType;
};
export type GetTemplateAggregateType<T extends TemplateAggregateArgs> = {
    [P in keyof T & keyof AggregateTemplate]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTemplate[P]> : Prisma.GetScalarType<T[P], AggregateTemplate[P]>;
};
export type TemplateGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TemplateWhereInput;
    orderBy?: Prisma.TemplateOrderByWithAggregationInput | Prisma.TemplateOrderByWithAggregationInput[];
    by: Prisma.TemplateScalarFieldEnum[] | Prisma.TemplateScalarFieldEnum;
    having?: Prisma.TemplateScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TemplateCountAggregateInputType | true;
    _avg?: TemplateAvgAggregateInputType;
    _sum?: TemplateSumAggregateInputType;
    _min?: TemplateMinAggregateInputType;
    _max?: TemplateMaxAggregateInputType;
};
export type TemplateGroupByOutputType = {
    id: string;
    name: string;
    thumbnailUrl: string | null;
    publishedAt: Date | null;
    usageCount: number;
    _count: TemplateCountAggregateOutputType | null;
    _avg: TemplateAvgAggregateOutputType | null;
    _sum: TemplateSumAggregateOutputType | null;
    _min: TemplateMinAggregateOutputType | null;
    _max: TemplateMaxAggregateOutputType | null;
};
type GetTemplateGroupByPayload<T extends TemplateGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TemplateGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TemplateGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TemplateGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TemplateGroupByOutputType[P]>;
}>>;
export type TemplateWhereInput = {
    AND?: Prisma.TemplateWhereInput | Prisma.TemplateWhereInput[];
    OR?: Prisma.TemplateWhereInput[];
    NOT?: Prisma.TemplateWhereInput | Prisma.TemplateWhereInput[];
    id?: Prisma.StringFilter<"Template"> | string;
    name?: Prisma.StringFilter<"Template"> | string;
    thumbnailUrl?: Prisma.StringNullableFilter<"Template"> | string | null;
    publishedAt?: Prisma.DateTimeNullableFilter<"Template"> | Date | string | null;
    usageCount?: Prisma.IntFilter<"Template"> | number;
};
export type TemplateOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    thumbnailUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    publishedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    usageCount?: Prisma.SortOrder;
};
export type TemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.TemplateWhereInput | Prisma.TemplateWhereInput[];
    OR?: Prisma.TemplateWhereInput[];
    NOT?: Prisma.TemplateWhereInput | Prisma.TemplateWhereInput[];
    name?: Prisma.StringFilter<"Template"> | string;
    thumbnailUrl?: Prisma.StringNullableFilter<"Template"> | string | null;
    publishedAt?: Prisma.DateTimeNullableFilter<"Template"> | Date | string | null;
    usageCount?: Prisma.IntFilter<"Template"> | number;
}, "id">;
export type TemplateOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    thumbnailUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    publishedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    usageCount?: Prisma.SortOrder;
    _count?: Prisma.TemplateCountOrderByAggregateInput;
    _avg?: Prisma.TemplateAvgOrderByAggregateInput;
    _max?: Prisma.TemplateMaxOrderByAggregateInput;
    _min?: Prisma.TemplateMinOrderByAggregateInput;
    _sum?: Prisma.TemplateSumOrderByAggregateInput;
};
export type TemplateScalarWhereWithAggregatesInput = {
    AND?: Prisma.TemplateScalarWhereWithAggregatesInput | Prisma.TemplateScalarWhereWithAggregatesInput[];
    OR?: Prisma.TemplateScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TemplateScalarWhereWithAggregatesInput | Prisma.TemplateScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Template"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Template"> | string;
    thumbnailUrl?: Prisma.StringNullableWithAggregatesFilter<"Template"> | string | null;
    publishedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Template"> | Date | string | null;
    usageCount?: Prisma.IntWithAggregatesFilter<"Template"> | number;
};
export type TemplateCreateInput = {
    id: string;
    name: string;
    thumbnailUrl?: string | null;
    publishedAt?: Date | string | null;
    usageCount?: number;
};
export type TemplateUncheckedCreateInput = {
    id: string;
    name: string;
    thumbnailUrl?: string | null;
    publishedAt?: Date | string | null;
    usageCount?: number;
};
export type TemplateUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    thumbnailUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    usageCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TemplateUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    thumbnailUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    usageCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TemplateCreateManyInput = {
    id: string;
    name: string;
    thumbnailUrl?: string | null;
    publishedAt?: Date | string | null;
    usageCount?: number;
};
export type TemplateUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    thumbnailUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    usageCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TemplateUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    thumbnailUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    usageCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TemplateCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    thumbnailUrl?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    usageCount?: Prisma.SortOrder;
};
export type TemplateAvgOrderByAggregateInput = {
    usageCount?: Prisma.SortOrder;
};
export type TemplateMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    thumbnailUrl?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    usageCount?: Prisma.SortOrder;
};
export type TemplateMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    thumbnailUrl?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    usageCount?: Prisma.SortOrder;
};
export type TemplateSumOrderByAggregateInput = {
    usageCount?: Prisma.SortOrder;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type TemplateSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    thumbnailUrl?: boolean;
    publishedAt?: boolean;
    usageCount?: boolean;
}, ExtArgs["result"]["template"]>;
export type TemplateSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    thumbnailUrl?: boolean;
    publishedAt?: boolean;
    usageCount?: boolean;
}, ExtArgs["result"]["template"]>;
export type TemplateSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    thumbnailUrl?: boolean;
    publishedAt?: boolean;
    usageCount?: boolean;
}, ExtArgs["result"]["template"]>;
export type TemplateSelectScalar = {
    id?: boolean;
    name?: boolean;
    thumbnailUrl?: boolean;
    publishedAt?: boolean;
    usageCount?: boolean;
};
export type TemplateOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "thumbnailUrl" | "publishedAt" | "usageCount", ExtArgs["result"]["template"]>;
export type $TemplatePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Template";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        thumbnailUrl: string | null;
        publishedAt: Date | null;
        usageCount: number;
    }, ExtArgs["result"]["template"]>;
    composites: {};
};
export type TemplateGetPayload<S extends boolean | null | undefined | TemplateDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TemplatePayload, S>;
export type TemplateCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TemplateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TemplateCountAggregateInputType | true;
};
export interface TemplateDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Template'];
        meta: {
            name: 'Template';
        };
    };
    findUnique<T extends TemplateFindUniqueArgs>(args: Prisma.SelectSubset<T, TemplateFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TemplateFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TemplateFindFirstArgs>(args?: Prisma.SelectSubset<T, TemplateFindFirstArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TemplateFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TemplateFindManyArgs>(args?: Prisma.SelectSubset<T, TemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TemplateCreateArgs>(args: Prisma.SelectSubset<T, TemplateCreateArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TemplateCreateManyArgs>(args?: Prisma.SelectSubset<T, TemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TemplateCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TemplateDeleteArgs>(args: Prisma.SelectSubset<T, TemplateDeleteArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TemplateUpdateArgs>(args: Prisma.SelectSubset<T, TemplateUpdateArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TemplateDeleteManyArgs>(args?: Prisma.SelectSubset<T, TemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TemplateUpdateManyArgs>(args: Prisma.SelectSubset<T, TemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TemplateUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TemplateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TemplateUpsertArgs>(args: Prisma.SelectSubset<T, TemplateUpsertArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TemplateCountArgs>(args?: Prisma.Subset<T, TemplateCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TemplateCountAggregateOutputType> : number>;
    aggregate<T extends TemplateAggregateArgs>(args: Prisma.Subset<T, TemplateAggregateArgs>): Prisma.PrismaPromise<GetTemplateAggregateType<T>>;
    groupBy<T extends TemplateGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TemplateGroupByArgs['orderBy'];
    } : {
        orderBy?: TemplateGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TemplateFieldRefs;
}
export interface Prisma__TemplateClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TemplateFieldRefs {
    readonly id: Prisma.FieldRef<"Template", 'String'>;
    readonly name: Prisma.FieldRef<"Template", 'String'>;
    readonly thumbnailUrl: Prisma.FieldRef<"Template", 'String'>;
    readonly publishedAt: Prisma.FieldRef<"Template", 'DateTime'>;
    readonly usageCount: Prisma.FieldRef<"Template", 'Int'>;
}
export type TemplateFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    where: Prisma.TemplateWhereUniqueInput;
};
export type TemplateFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    where: Prisma.TemplateWhereUniqueInput;
};
export type TemplateFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    where?: Prisma.TemplateWhereInput;
    orderBy?: Prisma.TemplateOrderByWithRelationInput | Prisma.TemplateOrderByWithRelationInput[];
    cursor?: Prisma.TemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TemplateScalarFieldEnum | Prisma.TemplateScalarFieldEnum[];
};
export type TemplateFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    where?: Prisma.TemplateWhereInput;
    orderBy?: Prisma.TemplateOrderByWithRelationInput | Prisma.TemplateOrderByWithRelationInput[];
    cursor?: Prisma.TemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TemplateScalarFieldEnum | Prisma.TemplateScalarFieldEnum[];
};
export type TemplateFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    where?: Prisma.TemplateWhereInput;
    orderBy?: Prisma.TemplateOrderByWithRelationInput | Prisma.TemplateOrderByWithRelationInput[];
    cursor?: Prisma.TemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TemplateScalarFieldEnum | Prisma.TemplateScalarFieldEnum[];
};
export type TemplateCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TemplateCreateInput, Prisma.TemplateUncheckedCreateInput>;
};
export type TemplateCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TemplateCreateManyInput | Prisma.TemplateCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TemplateCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    data: Prisma.TemplateCreateManyInput | Prisma.TemplateCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TemplateUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TemplateUpdateInput, Prisma.TemplateUncheckedUpdateInput>;
    where: Prisma.TemplateWhereUniqueInput;
};
export type TemplateUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TemplateUpdateManyMutationInput, Prisma.TemplateUncheckedUpdateManyInput>;
    where?: Prisma.TemplateWhereInput;
    limit?: number;
};
export type TemplateUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TemplateUpdateManyMutationInput, Prisma.TemplateUncheckedUpdateManyInput>;
    where?: Prisma.TemplateWhereInput;
    limit?: number;
};
export type TemplateUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    where: Prisma.TemplateWhereUniqueInput;
    create: Prisma.XOR<Prisma.TemplateCreateInput, Prisma.TemplateUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TemplateUpdateInput, Prisma.TemplateUncheckedUpdateInput>;
};
export type TemplateDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    where: Prisma.TemplateWhereUniqueInput;
};
export type TemplateDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TemplateWhereInput;
    limit?: number;
};
export type TemplateDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
};
export {};
