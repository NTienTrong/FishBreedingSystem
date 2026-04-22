"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AttributeService } from "@/services/attribute.service";
import { CategoryService } from "@/services/category.service";
import { ProductService } from "@/services/product.service";
import { AttributeResponse } from "@/types/attribute";
import { CategoryResponse } from "@/types/category";
import { ProductRequest } from "@/types/product";

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: number;
}

type FormImage = {
  imageUrl: string;
  isMain: boolean;
};

type FormAttributeValue = {
  attributeId: string;
  attrValue: string;
};

export default function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [attributes, setAttributes] = useState<AttributeResponse[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [slugPreview, setSlugPreview] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    summary: "",
    description: "",
    price: "0",
    stockQuantity: "0",
    isActive: true,
    categoryIds: [] as number[],
    images: [] as FormImage[],
    attributeValues: [] as FormAttributeValue[],
  });

  const pageTitle = useMemo(() => {
    if (isEdit) {
      return productId ? `Cập nhật sản phẩm #${productId}` : "Cập nhật sản phẩm";
    }
    return "Thêm sản phẩm mới";
  }, [isEdit, productId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryData, attributeData] = await Promise.all([
          CategoryService.getAll(),
          AttributeService.getAll(),
        ]);
        setCategories(categoryData);
        setAttributes(attributeData);

        if (isEdit) {
          if (!productId) {
            setErrors({ fetch: "Thiếu ID sản phẩm cần chỉnh sửa." });
            return;
          }

          const detail = await ProductService.getById(productId);
          setSlugPreview(detail.slug || "");
          setFormData({
            name: detail.name || "",
            sku: detail.sku || "",
            summary: detail.summary || "",
            description: detail.description || "",
            price: String(detail.price ?? 0),
            stockQuantity: String(detail.stockQuantity ?? 0),
            isActive: Boolean(detail.isActive),
            categoryIds: detail.categories.map((item) => item.id),
            images: detail.images.map((item) => ({
              imageUrl: item.imageUrl,
              isMain: item.isMain,
            })),
            attributeValues: detail.attributeValues.map((item) => ({
              attributeId: String(item.attributeId),
              attrValue: item.attrValue,
            })),
          });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Không thể tải dữ liệu sản phẩm.";
        setErrors({ fetch: message });
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [isEdit, productId]);

  const clearFieldError = (field: string) => {
    if (!errors[field]) {
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const toggleCategory = (categoryId: number) => {
    setFormData((prev) => {
      const exists = prev.categoryIds.includes(categoryId);
      const nextCategoryIds = exists
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId];

      return { ...prev, categoryIds: nextCategoryIds };
    });
    clearFieldError("categoryIds");
  };

  const addImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { imageUrl: "", isMain: prev.images.length === 0 }],
    }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData((prev) => {
      const next = [...prev.images];
      next[index] = { ...next[index], imageUrl: value };
      return { ...prev, images: next };
    });
  };

  const setMainImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, idx) => ({ ...img, isMain: idx === index })),
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const next = prev.images.filter((_, idx) => idx !== index);
      if (next.length > 0 && !next.some((item) => item.isMain)) {
        next[0] = { ...next[0], isMain: true };
      }
      return { ...prev, images: next };
    });
  };

  const addAttributeValue = () => {
    setFormData((prev) => ({
      ...prev,
      attributeValues: [...prev.attributeValues, { attributeId: "", attrValue: "" }],
    }));
  };

  const updateAttributeValue = (index: number, key: "attributeId" | "attrValue", value: string) => {
    setFormData((prev) => {
      const next = [...prev.attributeValues];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, attributeValues: next };
    });
  };

  const removeAttributeValue = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributeValues: prev.attributeValues.filter((_, idx) => idx !== index),
    }));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Tên sản phẩm là bắt buộc.";
    }

    const parsedPrice = Number(formData.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      nextErrors.price = "Giá sản phẩm phải lớn hơn hoặc bằng 0.";
    }

    const parsedStock = Number(formData.stockQuantity);
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      nextErrors.stockQuantity = "Tồn kho phải lớn hơn hoặc bằng 0.";
    }

    if (formData.categoryIds.length === 0) {
      nextErrors.categoryIds = "Vui lòng chọn ít nhất 1 danh mục.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = (): ProductRequest => {
    const trimmedImages = formData.images
      .map((item) => ({ ...item, imageUrl: item.imageUrl.trim() }))
      .filter((item) => item.imageUrl);

    const images = trimmedImages.map((item, index) => ({
      imageUrl: item.imageUrl,
      isMain: item.isMain,
      sortOrder: index,
    }));

    if (images.length > 0 && !images.some((item) => item.isMain)) {
      images[0].isMain = true;
    }

    const attributeValues = formData.attributeValues
      .filter((item) => item.attributeId && item.attrValue.trim())
      .map((item) => ({
        attributeId: Number(item.attributeId),
        attrValue: item.attrValue.trim(),
      }));

    return {
      name: formData.name.trim(),
      sku: formData.sku.trim() || null,
      summary: formData.summary.trim() || null,
      description: formData.description.trim() || null,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      isActive: formData.isActive,
      categoryIds: formData.categoryIds,
      images,
      attributeValues,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const payload = buildPayload();

      if (isEdit) {
        if (!productId) {
          throw new Error("Thiếu ID sản phẩm để cập nhật.");
        }
        await ProductService.update(productId, payload);
      } else {
        await ProductService.create(payload);
      }

      router.push("/admin/products");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể lưu sản phẩm.";
      setErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="p-8 text-slate-500">Đang tải dữ liệu sản phẩm...</div>;
  }

  return (
    <div className="p-8">
      <form className="max-w-6xl mx-auto grid grid-cols-12 gap-8" onSubmit={handleSubmit}>
        <div className="col-span-12 flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-headline font-extrabold text-primary tracking-tight">
              {pageTitle}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Thiết lập thông tin sản phẩm và kết nối trực tiếp API backend.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/products"
              className="px-6 py-2.5 rounded-full border border-outline-variant text-primary font-bold text-sm hover:bg-surface-container-low transition-colors"
            >
              Hủy
            </Link>
            <button
              className="px-8 py-2.5 rounded-full bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-70 disabled:hover:scale-100"
              type="submit"
              disabled={loading || !!errors.fetch}
            >
              {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Lưu sản phẩm"}
            </button>
          </div>
        </div>

        {errors.fetch && <div className="col-span-12 p-4 bg-error/10 text-error rounded-xl text-sm">{errors.fetch}</div>}
        {errors.submit && <div className="col-span-12 p-4 bg-error/10 text-error rounded-xl text-sm">{errors.submit}</div>}

        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="bg-surface-container-lowest p-8 rounded-xl space-y-6 shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Tên sản phẩm</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 outline-none ${errors.name ? "ring-2 ring-error" : ""}`}
                  placeholder="Ví dụ: Cá Koi Nhật Bản - Tancho Kohaku"
                  value={formData.name}
                  name="name"
                  onChange={handleInputChange}
                  type="text"
                />
                {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Mã SKU</label>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 pl-10 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="SKU-2024-001"
                    value={formData.sku}
                    name="sku"
                    onChange={handleInputChange}
                    type="text"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-sm">barcode</span>
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Đường dẫn (Slug)</label>
                <input
                  className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-500 italic cursor-not-allowed outline-none"
                  disabled
                  placeholder="Slug sẽ tự tạo sau khi lưu"
                  value={slugPreview}
                  type="text"
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
            <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Tóm tắt</label>
            <textarea
              className="w-full bg-surface-container-highest border-none rounded-lg p-4 outline-none resize-y"
              rows={3}
              placeholder="Tóm tắt ngắn để hiển thị nhanh"
              value={formData.summary}
              name="summary"
              onChange={handleInputChange}
            ></textarea>

            <label className="block text-xs font-bold text-primary uppercase tracking-widest mt-6 mb-2">Mô tả chi tiết</label>
            <textarea
              className="w-full bg-surface-container-highest border-none rounded-lg p-4 outline-none resize-y"
              rows={7}
              placeholder="Mô tả đầy đủ thông tin kỹ thuật của sản phẩm"
              value={formData.description}
              name="description"
              onChange={handleInputChange}
            ></textarea>
          </section>

          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-primary uppercase tracking-widest">Ảnh sản phẩm (URL)</label>
              <button
                type="button"
                className="text-sm font-semibold text-primary hover:underline"
                onClick={addImage}
              >
                + Thêm ảnh
              </button>
            </div>

            {formData.images.length === 0 ? (
              <p className="text-sm text-slate-400">Chưa có ảnh nào. Nhấn &quot;Thêm ảnh&quot; để thêm URL ảnh.</p>
            ) : (
              formData.images.map((image, index) => (
                <div key={`${index}-${image.imageUrl}`} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-8">
                    <input
                      className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm outline-none"
                      placeholder="https://..."
                      value={image.imageUrl}
                      onChange={(event) => updateImage(index, event.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className={`col-span-2 px-3 py-2 rounded-lg text-xs font-semibold ${image.isMain ? "bg-primary text-white" : "bg-slate-100 text-slate-600"}`}
                    onClick={() => setMainImage(index)}
                  >
                    Ảnh chính
                  </button>
                  <button
                    type="button"
                    className="col-span-2 px-3 py-2 rounded-lg text-xs font-semibold bg-error/10 text-error"
                    onClick={() => removeImage(index)}
                  >
                    Xóa
                  </button>
                </div>
              ))
            )}
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-primary uppercase tracking-widest">Trạng thái</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={formData.isActive}
                  className="sr-only peer"
                  type="checkbox"
                  onChange={(event) => setFormData((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Giá bán (VNĐ)</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none ${errors.price ? "ring-2 ring-error" : ""}`}
                  placeholder="0"
                  value={formData.price}
                  name="price"
                  onChange={handleInputChange}
                  type="number"
                  min={0}
                />
                {errors.price && <p className="text-xs text-error mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Số lượng tồn kho</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none ${errors.stockQuantity ? "ring-2 ring-error" : ""}`}
                  placeholder="0"
                  value={formData.stockQuantity}
                  name="stockQuantity"
                  onChange={handleInputChange}
                  type="number"
                  min={0}
                />
                {errors.stockQuantity && <p className="text-xs text-error mt-1">{errors.stockQuantity}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-2">Danh mục</label>
                <div className="max-h-45 overflow-y-auto space-y-2 pr-1">
                  {categories.map((category) => {
                    const checked = formData.categoryIds.includes(category.id);
                    return (
                      <label key={category.id} className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          className="rounded border-outline-variant text-primary focus:ring-primary"
                          checked={checked}
                          onChange={() => toggleCategory(category.id)}
                        />
                        <span>{category.name}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.categoryIds && <p className="text-xs text-error mt-1">{errors.categoryIds}</p>}
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-secondary space-y-3">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">science</span>
              Thuộc tính sản phẩm
            </h3>
            <button
              type="button"
              className="text-sm font-semibold text-primary hover:underline"
              onClick={addAttributeValue}
            >
              + Thêm thuộc tính
            </button>

            {formData.attributeValues.length === 0 ? (
              <p className="text-sm text-slate-400">Chưa có thuộc tính nào.</p>
            ) : (
              formData.attributeValues.map((item, index) => (
                <div key={`${index}-${item.attributeId}`} className="space-y-2 rounded-lg bg-surface-container-highest p-3">
                  <select
                    className="w-full bg-white border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none"
                    value={item.attributeId}
                    onChange={(event) => updateAttributeValue(index, "attributeId", event.target.value)}
                  >
                    <option value="">Chọn thuộc tính</option>
                    {attributes.map((attribute) => (
                      <option key={attribute.id} value={attribute.id}>
                        {attribute.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-white border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none"
                      placeholder="Giá trị thuộc tính"
                      value={item.attrValue}
                      onChange={(event) => updateAttributeValue(index, "attrValue", event.target.value)}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-error/10 text-error"
                      onClick={() => removeAttributeValue(index)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </form>
    </div>
  );
}
