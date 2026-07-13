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
  const [uploadingImageIndexes, setUploadingImageIndexes] = useState<number[]>([]);
  const [slugPreview, setSlugPreview] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    summary: "",
    description: "",
    price: "0",
    costPrice: "0",
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
            summary: detail.summary || "",
            description: detail.description || "",
            price: String(detail.price ?? 0),
            costPrice: String(detail.costPrice ?? 0),
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
      const current = next[index] ?? { imageUrl: "", isMain: index === 0 };
      next[index] = { ...current, imageUrl: value };
      return { ...prev, images: next };
    });

    clearFieldError(`images-${index}`);
  };

  const setImageUploading = (index: number, value: boolean) => {
    setUploadingImageIndexes((prev) => {
      if (value && !prev.includes(index)) {
        return [...prev, index];
      }

      if (!value) {
        return prev.filter((item) => item !== index);
      }

      return prev;
    });
  };

  const uploadImageToCloudinary = async (index: number, file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [`images-${index}`]: "Chỉ chấp nhận định dạng JPG, PNG, WebP hoặc GIF.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [`images-${index}`]: "Ảnh không được vượt quá 5MB." }));
      return;
    }

    clearFieldError(`images-${index}`);
    setImageUploading(index, true);

    try {
      const imageUrl = await ProductService.uploadImage(file);
      updateImage(index, imageUrl);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload ảnh thất bại.";
      setErrors((prev) => ({ ...prev, [`images-${index}`]: message }));
    } finally {
      setImageUploading(index, false);
    }
  };

  const handleUploadNewImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const nextIndex = formData.images.length;
    addImage();
    await uploadImageToCloudinary(nextIndex, file);
    event.target.value = "";
  };

  const handleUploadExistingImage = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await uploadImageToCloudinary(index, file);
    event.target.value = "";
  };

  const setMainImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, idx) => ({ ...img, isMain: idx === index })),
    }));
  };

  const removeImage = (index: number) => {
    setImageUploading(index, false);
    clearFieldError(`images-${index}`);

    setUploadingImageIndexes((prev) =>
      prev
        .filter((item) => item !== index)
        .map((item) => (item > index ? item - 1 : item))
    );

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

    const parsedCostPrice = Number(formData.costPrice);
    if (!Number.isFinite(parsedCostPrice) || parsedCostPrice < 0) {
      nextErrors.costPrice = "Giá nhập sản phẩm phải lớn hơn hoặc bằng 0.";
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
      summary: formData.summary.trim() || null,
      description: formData.description.trim() || null,
      price: Number(formData.price),
      costPrice: Number(formData.costPrice),
      isActive: formData.isActive,
      categoryIds: formData.categoryIds,
      images,
      attributeValues,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (uploadingImageIndexes.length > 0) {
      setErrors((prev) => ({ ...prev, submit: "Vui lòng đợi upload ảnh hoàn tất trước khi lưu." }));
      return;
    }

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

      const message = isEdit ? "Cập nhật sản phẩm thành công." : "Thêm sản phẩm thành công.";
      router.push(`/admin/products?message=${encodeURIComponent(message)}&variant=success`);
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
              disabled={loading || !!errors.fetch || uploadingImageIndexes.length > 0}
            >
              {loading ? "Đang lưu..." : uploadingImageIndexes.length > 0 ? "Đang tải ảnh..." : isEdit ? "Lưu thay đổi" : "Lưu sản phẩm"}
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
              <div className="col-span-2">
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
              <label className="block text-xs font-bold text-primary uppercase tracking-widest">Ảnh sản phẩm</label>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-primary hover:underline cursor-pointer">
                  + Tải ảnh từ máy
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={loading}
                    onChange={handleUploadNewImage}
                  />
                </label>
              </div>
            </div>

            {formData.images.length === 0 ? (
              <p className="text-sm text-slate-400">Chưa có ảnh nào. Bạn có thể upload từ máy hoặc dán URL ảnh.</p>
            ) : (
              formData.images.map((image, index) => (
                <div key={`${index}-${image.imageUrl}`} className="space-y-2">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-2">
                      <div className="h-14 w-14 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                        {image.imageUrl.trim() ? (
                          <div
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${image.imageUrl})` }}
                            aria-label={`Ảnh sản phẩm ${index + 1}`}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-slate-400 text-lg">image</span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-4">
                      <input
                        className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm outline-none"
                        placeholder="https://..."
                        value={image.imageUrl}
                        onChange={(event) => updateImage(index, event.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="col-span-2 px-3 py-2 rounded-lg text-xs font-semibold bg-error/10 text-error"
                      onClick={() => removeImage(index)}
                    >
                      Xóa
                    </button>
                  </div>
                  {errors[`images-${index}`] && <p className="text-xs text-error">{errors[`images-${index}`]}</p>}
                </div>
              ))
            )}
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Trạng thái</label>
              <select
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.value === "active" }))}
                className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm outline-none"
              >
                <option value="active">Đang kinh doanh</option>
                <option value="inactive">Ngừng kinh doanh</option>
              </select>
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
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                  Giá nhập (VNĐ) <span className="text-slate-400 font-normal text-[10px]">(Cập nhật từ Quản lý kho)</span>
                </label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none ${errors.costPrice ? "ring-2 ring-error" : ""}`}
                  placeholder="0"
                  value={formData.costPrice}
                  name="costPrice"
                  onChange={handleInputChange}
                  type="number"
                  min={0}
                />
                {errors.costPrice && <p className="text-xs text-error mt-1">{errors.costPrice}</p>}
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
