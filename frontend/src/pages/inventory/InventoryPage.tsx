import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { DataTable } from '../../components/common/DataTable';
import { useInventory } from '../../hooks/useInventory';

const todayISO = () => new Date().toISOString().slice(0, 10);

const productSchema = z.object({
  sku: z.string().min(2),
  product_name: z.string().min(2),
  category: z.string().optional(),
  unit_price: z.coerce.number().nonnegative(),
  current_stock: z.coerce.number().nonnegative(),
  reorder_level: z.coerce.number().nonnegative()
});

const supplierSchema = z.object({
  supplier_name: z.string().min(2),
  contact_email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional()
});

const poSchema = z.object({
  supplier_id: z.coerce.number().positive('Supplier ID is required'),
  order_date: z.string().min(1, 'Order date is required'),
  expected_date: z.string().optional(),
  product_id: z.coerce.number().positive('Product ID is required'),
  quantity: z.coerce.number().positive('Must be greater than 0'),
  unit_price: z.coerce.number().nonnegative('Must be 0 or greater')
});

type ProductForm = z.infer<typeof productSchema>;
type SupplierForm = z.infer<typeof supplierSchema>;
type PoForm = z.infer<typeof poSchema>;

export const InventoryPage = () => {
  const [openProduct, setOpenProduct] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);
  const [openPo, setOpenPo] = useState(false);

  const {
    products,
    suppliers,
    purchaseOrders,
    stockMovements,
    createProduct,
    createSupplier,
    createPurchaseOrder
  } = useInventory();

  const productForm = useForm<ProductForm>({ resolver: zodResolver(productSchema) });
  const supplierForm = useForm<SupplierForm>({ resolver: zodResolver(supplierSchema) });
  const poForm = useForm<PoForm>({
    resolver: zodResolver(poSchema),
    defaultValues: { order_date: todayISO() }
  });

  const submitProduct = productForm.handleSubmit(async (values) => {
    await createProduct.mutateAsync(values);
    productForm.reset();
    setOpenProduct(false);
  });

  const submitSupplier = supplierForm.handleSubmit(async (values) => {
    await createSupplier.mutateAsync({ ...values, contact_email: values.contact_email || undefined });
    supplierForm.reset();
    setOpenSupplier(false);
  });

  const submitPo = poForm.handleSubmit(async (values) => {
    await createPurchaseOrder.mutateAsync({
      supplier_id: values.supplier_id,
      order_date: values.order_date,
      expected_date: values.expected_date,
      items: [
        {
          product_id: values.product_id,
          quantity: values.quantity,
          unit_price: values.unit_price
        }
      ]
    });
    poForm.reset({ order_date: todayISO() });
    setOpenPo(false);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Inventory & Purchasing</h1>
        <div className="flex gap-2">
          <Button onClick={() => setOpenProduct(true)}>Add Product</Button>
          <Button onClick={() => setOpenSupplier(true)} variant="secondary">
            Add Supplier
          </Button>
          <Button onClick={() => setOpenPo(true)} variant="secondary">
            Create PO
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div>
          <h3 className="mb-2 text-lg font-semibold">Products</h3>
          <DataTable
            columns={[
              { key: 'sku', header: 'SKU' },
              { key: 'product_name', header: 'Product' },
              { key: 'category', header: 'Category' },
              { key: 'current_stock', header: 'Stock' },
              { key: 'reorder_level', header: 'Reorder Level' }
            ]}
            isLoading={products.isLoading}
            isError={products.isError}
            data={(products.data || []).map((p) => ({ ...p, category: p.category || '-' }))}
          />
        </div>

        <div>
          <h3 className="mb-2 text-lg font-semibold">Suppliers</h3>
          <DataTable
            columns={[
              { key: 'supplier_name', header: 'Supplier' },
              { key: 'contact_email', header: 'Email' },
              { key: 'phone', header: 'Phone' },
              { key: 'address', header: 'Address' }
            ]}
            isLoading={suppliers.isLoading}
            isError={suppliers.isError}
            data={(suppliers.data || []).map((s) => ({
              ...s,
              contact_email: s.contact_email || '-',
              phone: s.phone || '-',
              address: s.address || '-'
            }))}
          />
        </div>
      </div>

      <Card>
        <h3 className="mb-2 text-lg font-semibold">Purchase Orders</h3>
        <DataTable
          columns={[
            { key: 'id', header: 'PO #' },
            { key: 'supplier', header: 'Supplier' },
            { key: 'order_date', header: 'Order Date' },
            { key: 'status', header: 'Status' },
            { key: 'total_amount', header: 'Amount' }
          ]}
          isLoading={purchaseOrders.isLoading}
          isError={purchaseOrders.isError}
          data={(purchaseOrders.data || []).map((po) => ({
            id: po.id,
            supplier: po.supplier?.supplier_name || po.supplier_id,
            order_date: po.order_date,
            status: po.status,
            total_amount: po.total_amount
          }))}
        />
      </Card>

      <Card>
        <h3 className="mb-2 text-lg font-semibold">Stock Movements</h3>
        <DataTable
          columns={[
            { key: 'id', header: 'ID' },
            { key: 'product', header: 'Product' },
            { key: 'movement_type', header: 'Type' },
            { key: 'quantity', header: 'Quantity' },
            { key: 'movement_date', header: 'Date' }
          ]}
          isLoading={stockMovements.isLoading}
          isError={stockMovements.isError}
          data={(stockMovements.data || []).map((m) => ({
            id: m.id,
            product: m.product?.product_name || m.product_id,
            movement_type: m.movement_type,
            quantity: m.quantity,
            movement_date: m.movement_date
          }))}
        />
      </Card>

      <Modal isOpen={openProduct} onClose={() => setOpenProduct(false)} title="Add Product">
        <form className="space-y-3" onSubmit={submitProduct}>
          <div>
            <Input placeholder="SKU *" {...productForm.register('sku')} />
            {productForm.formState.errors.sku && (
              <p className="mt-1 text-sm text-red-500">{productForm.formState.errors.sku.message}</p>
            )}
          </div>
          <div>
            <Input placeholder="Product Name *" {...productForm.register('product_name')} />
            {productForm.formState.errors.product_name && (
              <p className="mt-1 text-sm text-red-500">{productForm.formState.errors.product_name.message}</p>
            )}
          </div>
          <Input placeholder="Category" {...productForm.register('category')} />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Input type="number" step="0.01" placeholder="Unit Price *" {...productForm.register('unit_price')} />
              {productForm.formState.errors.unit_price && (
                <p className="mt-1 text-sm text-red-500">{productForm.formState.errors.unit_price.message}</p>
              )}
            </div>
            <Input type="number" step="0.01" placeholder="Stock" {...productForm.register('current_stock')} />
            <Input type="number" step="0.01" placeholder="Reorder" {...productForm.register('reorder_level')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpenProduct(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProduct.isPending}>
              {createProduct.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={openSupplier} onClose={() => setOpenSupplier(false)} title="Add Supplier">
        <form className="space-y-3" onSubmit={submitSupplier}>
          <div>
            <Input placeholder="Supplier Name *" {...supplierForm.register('supplier_name')} />
            {supplierForm.formState.errors.supplier_name && (
              <p className="mt-1 text-sm text-red-500">{supplierForm.formState.errors.supplier_name.message}</p>
            )}
          </div>
          <Input placeholder="Email" {...supplierForm.register('contact_email')} />
          <Input placeholder="Phone" {...supplierForm.register('phone')} />
          <Input placeholder="Address" {...supplierForm.register('address')} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpenSupplier(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSupplier.isPending}>
              {createSupplier.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={openPo} onClose={() => setOpenPo(false)} title="Create Purchase Order">
        <form className="space-y-3" onSubmit={submitPo}>
          <div>
            <Input type="number" placeholder="Supplier ID *" {...poForm.register('supplier_id')} />
            {poForm.formState.errors.supplier_id && (
              <p className="mt-1 text-sm text-red-500">{poForm.formState.errors.supplier_id.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input type="date" {...poForm.register('order_date')} />
              {poForm.formState.errors.order_date && (
                <p className="mt-1 text-sm text-red-500">{poForm.formState.errors.order_date.message}</p>
              )}
            </div>
            <Input type="date" {...poForm.register('expected_date')} />
          </div>
          <div>
            <Input type="number" placeholder="Product ID *" {...poForm.register('product_id')} />
            {poForm.formState.errors.product_id && (
              <p className="mt-1 text-sm text-red-500">{poForm.formState.errors.product_id.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input type="number" step="0.01" placeholder="Quantity *" {...poForm.register('quantity')} />
              {poForm.formState.errors.quantity && (
                <p className="mt-1 text-sm text-red-500">{poForm.formState.errors.quantity.message}</p>
              )}
            </div>
            <div>
              <Input type="number" step="0.01" placeholder="Unit Price *" {...poForm.register('unit_price')} />
              {poForm.formState.errors.unit_price && (
                <p className="mt-1 text-sm text-red-500">{poForm.formState.errors.unit_price.message}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpenPo(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPurchaseOrder.isPending}>
              {createPurchaseOrder.isPending ? 'Saving...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
