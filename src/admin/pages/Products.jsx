import { useState, useEffect, useRef } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import AddProductModal from '../components/AddProductModal';
import AdminPagination from '../components/AdminPagination';
import { exportToExcel } from '../../utils/excelExport';
import { resolveImageUrl } from '../../utils/apiUrl';



  export default function Products() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');

    const [successMessage, setSuccessMessage] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingProduct, setEditingProduct] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    const [categoryFilter, setCategoryFilter] = useState('all');

    const [categories, setCategories] = useState([]);

    const [categoriesLoading, setCategoriesLoading] = useState(false);

    const [categoriesError, setCategoriesError] = useState('');

    const productRequest = useRef(0);

    const [statusFilter, setStatusFilter] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);

    const [totalProducts, setTotalProducts] = useState(0);

    const pageSize = 15;

    const filteredProducts = products;

    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [selectedProducts, setSelectedProducts] = useState([]);

  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);



    useEffect(() => {

      fetchProducts();

      return () => { productRequest.current += 1; };

    }, [categoryFilter, searchTerm, statusFilter, currentPage]);



    useEffect(() => {

      let cancelled = false;

      const fetchCategories = async () => {

        setCategoriesLoading(true);

        setCategoriesError('');

        try {

          const response = await categoryAPI.getAll();

          if (!response.data?.success || !Array.isArray(response.data.data)) {

            throw new Error('Failed to fetch categories');

          }

          if (!cancelled) setCategories(response.data.data.filter((category) => typeof category?.name === 'string' && category.name.trim()));

        } catch {

          if (!cancelled) {

            setCategories([]);

            setCategoriesError('Failed to fetch categories. Reload the page to try again.');

          }

        } finally {

          if (!cancelled) setCategoriesLoading(false);

        }

      };

      fetchCategories();

      return () => { cancelled = true; };

    }, []);



    const fetchProducts = async () => {

      const request = ++productRequest.current;

      setLoading(true);

      setError('');

      try {

        const params = {
          page: currentPage,
          limit: pageSize,
          status: statusFilter,
          ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
          ...(categoryFilter !== 'all' ? { category: categoryFilter } : {}),
        };
        const response = await productAPI.getAll(params);
        if (request !== productRequest.current) return;
        if (!response.data.success) throw new Error(response.data.message || 'Failed to fetch products');
        const nextProducts = response.data.data || [];
        setProducts(nextProducts);
        setTotalProducts(Number(response.data.total ?? nextProducts.length));

      } catch (err) {

        if (request === productRequest.current) {

          setProducts([]);

          setTotalProducts(0);

          setError(err.response?.data?.message || err.message || 'Failed to fetch products');

        }

      } finally {

        if (request === productRequest.current) setLoading(false);

      }

    };

    const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

    useEffect(() => {
      if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    useEffect(() => {
      setSelectedProducts([]);
    }, [currentPage, searchTerm, categoryFilter, statusFilter]);



    const handleAddProduct = () => {

      setEditingProduct(null);

      setIsModalOpen(true);

    };



    const handleEditProduct = (product) => {

      setEditingProduct(product);

      setIsModalOpen(true);

    };



    const handleDeleteClick = (id) => {

      setDeleteConfirmId(id);

    };



    const handleDeleteConfirm = async () => {

      if (!deleteConfirmId) return;

      try {

        await productAPI.delete(deleteConfirmId);

        setProducts((prev) => prev.filter((p) => p._id !== deleteConfirmId));
        setTotalProducts((total) => Math.max(0, total - 1));

        setDeleteConfirmId(null);

        setSuccessMessage('Product deleted successfully');

        setError('');

      } catch (err) {

        setError(err.response?.data?.message || 'Failed to delete product');

        setSuccessMessage('');

      }

    };



    const handleSelectAll = (e) => {

      if (e.target.checked) {

        setSelectedProducts(filteredProducts.map((p) => p._id));

      } else {

        setSelectedProducts([]);

      }

    };



    const handleSelectProduct = (id) => {

      setSelectedProducts((prev) =>

        prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]

      );

    };



    const handleBulkDelete = async () => {

      try {

        await Promise.all(selectedProducts.map((id) => productAPI.delete(id)));

        setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p._id)));
        setTotalProducts((total) => Math.max(0, total - selectedProducts.length));

        setSelectedProducts([]);

        setBulkDeleteConfirm(false);

        setSuccessMessage(`${selectedProducts.length} product(s) deleted successfully`);

        setError('');

      } catch (err) {

        setError(err.response?.data?.message || 'Failed to delete selected products');

        setSuccessMessage('');

      }

    };



    const handleModalClose = () => {

      setIsModalOpen(false);

      setEditingProduct(null);

    };



    const handleSaved = (message) => {

      setSuccessMessage(message || 'Product saved successfully');

      setError('');

      setCurrentPage(1);

      if (currentPage === 1) fetchProducts();

    };



    const clearFilters = () => {

      setSearchTerm('');

      setCategoryFilter('all');

      setStatusFilter('all');

      setCurrentPage(1);

    };



    const handleDownloadExcel = async () => {
      try {
        const params = {
          page: 1,
          limit: 100,
          status: statusFilter,
          ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
          ...(categoryFilter !== 'all' ? { category: categoryFilter } : {}),
        };
        const response = await productAPI.getAll(params);
        const exportProducts = response.data.data || [];
        const pagesToExport = Number(response.data.pages) || 1;
        for (let page = 2; page <= pagesToExport; page += 1) {
          const nextPage = await productAPI.getAll({ ...params, page });
          exportProducts.push(...(nextPage.data.data || []));
        }

        if (!exportProducts.length) {
          setError('No products available to export');
          setSuccessMessage('');
          return;
        }

        const exportData = exportProducts.map((product) => ({

          'Product Name': product.name || '',

          SKU: product.sku || '',

          Category: product.category || '',

          Metal: product.metal || '',

          Price: Number(product.price || 0),

          'Discount Price': Number(product.discountPrice || 0),

          Stock: Number(product.stock || 0),

          Bridal: product.bridal ? 'Yes' : 'No',

          Wedding: product.wedding ? 'Yes' : 'No',

          Status: product.status || '',

        }))



        exportToExcel({

          data: exportData,

          columns: [

            { wch: 30 },

            { wch: 18 },

            { wch: 18 },

            { wch: 15 },

            { wch: 15 },

            { wch: 18 },

            { wch: 12 },

            { wch: 15 },

          ],

          sheetName: 'Products',

          filename: 'products.xlsx',

        })



        setSuccessMessage('Products downloaded successfully')

        setError('')

      } catch (err) {

        console.error('Excel export error:', err)

        setError('Failed to download Excel file')

        setSuccessMessage('')

      }

    };



    const getStatusBadge = (status) => {

      const configs = {

        active: {

          bg: 'bg-primary-fixed-dim/20',

          text: 'text-on-primary-fixed-variant',

          border: 'border-primary-fixed-dim/30',

          label: 'Active',

          dot: 'bg-deep-emerald',

        },

        inactive: {

          bg: 'bg-error-container/20',

          text: 'text-error',

          border: 'border-error-container/30',

          label: 'Disabled',

          dot: 'bg-error',

        },

        draft: {

          bg: 'bg-surface-container/50',

          text: 'text-on-surface-variant',

          border: 'border-outline-variant/20',

          label: 'Draft',

          dot: 'bg-outline',

        },

      };

      const cfg = configs[status] || configs.draft;

      return (

        <span

          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps ${cfg.bg} ${cfg.text} ${cfg.border} border`}

        >

          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>

          {cfg.label}

        </span>

      );

    };



    const getStockBadge = (stock) => {

      const qty = stock || 0;

      if (qty === 0) {

        return (

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps bg-error-container/20 text-error border border-error-container/30">

            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>

            Out of Stock

          </span>

        );

      }

      if (qty < 10) {

        return (

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps bg-secondary-fixed/20 text-on-secondary-fixed border border-secondary-fixed/30">

            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>

            Low Stock ({qty})

          </span>

        );

      }

      return (

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps bg-primary-fixed-dim/20 text-on-primary-fixed-variant border border-primary-fixed-dim/30">

          <span className="w-1.5 h-1.5 rounded-full bg-deep-emerald"></span>

          In Stock ({qty})

        </span>

      );

    };



    const formatCurrency = (price, discountPrice) => {

      if (Number(discountPrice) > 0 && Number(discountPrice) < Number(price)) {

        return `₹${Number(discountPrice).toLocaleString('en-IN')}`;

      }

      if (!price && price !== 0) return '-';

      return `₹${Number(price).toLocaleString('en-IN')}`;

    };



    return (

      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">

            <div>

              <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">Product Management</h1>

              <p className="text-sm text-gray-500">

                Manage your inventory, prices, and product details.

              </p>

            </div>

            <button

              onClick={handleAddProduct}

              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-deep-emerald/90 active:scale-95 shadow-sm"

            >



              Add New Product

            </button>

          </div>



          {error && (

            <div className="p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">

              {error}

            </div>

          )}



          {successMessage && (

            <div className="p-4 bg-primary-fixed/20 border border-primary-fixed/30 text-primary rounded-lg text-sm">

              {successMessage}

            </div>

          )}



          {categoriesError && (

            <div role="alert" className="p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">

              {categoriesError}

            </div>

          )}



          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">

            <div className="relative w-full lg:w-96">

              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-lg">

                search

              </span>

              <input

                className="w-full bg-soft-cream border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-10 pr-4 text-sm font-body-md text-on-surface rounded transition-all"

                type="text"

                value={searchTerm}

                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}

                placeholder="Search products..."

              />

            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">

              <div className="relative min-w-[140px]">

                <select

                  className="w-full appearance-none bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all"

                  value={categoryFilter}

                  aria-label="Category filter"

                  aria-busy={categoriesLoading}

                  disabled={categoriesLoading}

                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}

                >

                  <option value="all">All Categories</option>

                  {categories.map((category) => (

                    <option key={category._id} value={category.name}>{category.name}</option>

                  ))}

                </select>



              </div>

              <div className="relative min-w-[140px]">

                <select

                  className="w-full appearance-none bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all"

                  value={statusFilter}

                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}

                >

                  <option value="all">All Statuses</option>

                  <option value="active">Active</option>

                  <option value="inactive">Disabled</option>

                  <option value="draft">Draft</option>

                </select>



              </div>

            </div>

          </div>



          <div className="flex items-center justify-between py-2 border-b border-outline-variant/50">

            <div className="flex items-center gap-1">

              <span className="font-body-md text-sm text-on-surface-variant">

                <span className="font-semibold text-deep-emerald">

                  {totalProducts}

                </span>{' '}

                items

              </span>

            </div>

            <div className="flex items-center gap-1">





              <button

              type="button"

              onClick={handleDownloadExcel}

              className="inline-flex items-center gap-2 px-4 py-2 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-[10px] rounded hover:bg-surface-container-low transition-colors"

              title="Download Excel"

              >

                <span className="material-symbols-outlined text-sm">

                  download

                </span>

                <span>Download</span>



              </button>

              <button

              type="button"

              onClick={() => setBulkDeleteConfirm(true)}

              disabled={selectedProducts.length === 0}

              className="inline-flex items-center gap-2 px-4 py-2 bg-error/10 text-error border border-error/20 font-label-caps text-[10px] rounded hover:bg-error hover:text-surface-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

              >

                <span className="material-symbols-outlined text-sm">delete</span>

                <span>Delete Selected ({selectedProducts.length})</span>



              </button>

            </div>

          </div>



          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            {loading ? (

              <div className="p-12 text-center">

                <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">

                  progress_activity

                </span>

                <p className="font-body-md text-sm text-on-surface-variant mt-2">

                  Loading products...

                </p>

              </div>

            ) : filteredProducts.length === 0 ? (

              <div className="p-12 text-center">

                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">

                  inventory_2

                </span>

                <p className="font-body-md text-sm text-on-surface-variant">

                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'

                    ? 'No products match your filters'

                    : 'No products found. Click "Add New Product" to get started.'}

                </p>

              </div>

            ) : (

              <>

                <div className="overflow-x-auto custom-scrollbar">

                  <table className="w-full text-left border-collapse min-w-[1000px]">

                    <thead>

                      <tr className="bg-surface-container-low border-b border-outline-variant">

                        <th className="py-4 pl-6 pr-4 w-12">

                          <input

                            className="rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald w-4 h-4 cursor-pointer"

                            type="checkbox"

                            checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}

                            onChange={handleSelectAll}

                          />

                        </th>

                        <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">

                          Product

                        </th>

                        <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">

                          SKU

                        </th>

                        <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">

                          Category

                        </th>

                        <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">

                          Metal

                        </th>

                        <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">

                          Price

                        </th>

                        <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">

                          Stock

                        </th>

                        <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">

                          Status

                        </th>

                        <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">

                          Actions

                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">

                      {filteredProducts.map((product) => (

                        <tr

                          key={product._id}

                          className="table-row-hover bg-surface-white group"

                        >

                          <td className="py-4 pl-6 pr-4">

                            <input

                              className="rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald w-4 h-4 cursor-pointer"

                              type="checkbox"

                              checked={selectedProducts.includes(product._id)}

                              onChange={() => handleSelectProduct(product._id)}

                            />

                          </td>

                          <td className="py-4 px-4">

                            <div className="flex items-center gap-4">

                              <div className="w-12 h-12 rounded bg-soft-cream border border-outline-variant/30 flex-shrink-0 overflow-hidden">

                                <img

                                  className="w-full h-full object-cover"

                                  alt={product.name}

                                  src={

                                    resolveImageUrl(

                                      product.primaryImage ||

                                      product.images?.[0]?.url ||

                                      product.images?.[0] ||

                                      product.image ||

                                      'https://placehold.co/48x48'

                                    )

                                  }

                                  onError={(e) => {

                                    e.target.src = 'https://placehold.co/48x48';

                                  }}

                                />

                              </div>

                              <div>

                                <p

                                  className="font-semibold text-deep-emerald group-hover:text-regal-gold transition-colors cursor-pointer"

                                  title={product.name}

                                >

                                  {product.name}

                                </p>

                                <p className="text-xs text-on-surface-variant mt-0.5">

                                  {product.category}

                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="py-4 px-4 text-on-surface font-mono text-xs">

                            {product.sku || '-'}

                          </td>

                          <td className="py-4 px-4">{product.category}</td>

                          <td className="py-4 px-4">{product.metal || '-'}</td>

                          <td className="py-4 px-4 text-right font-semibold">

                            {formatCurrency(product.price, product.discountPrice)}

                          </td>

                          <td className="py-4 px-4">

                            {getStockBadge(product.stock)}

                          </td>

                          <td className="py-4 px-4">

                            {getStatusBadge(product.status)}

                          </td>

                          <td className="py-4 px-6 text-right">

                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                              <button

                                onClick={() => handleEditProduct(product)}

                                className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"

                                title="Edit"

                              >

                                <span className="material-symbols-outlined text-s">

                                  Edit

                                </span>

                              </button>

                              <button

                                onClick={() => handleDeleteClick(product._id)}

                                className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"

                                title="Delete"

                              >

                                <span className="material-symbols-outlined text-s">

                                  Delete

                                </span>

                              </button>

                            </div>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </>

            )}

          </div>

          <AdminPagination
            totalItems={totalProducts}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="products"
            disabled={loading}
          />



        <AddProductModal

          isOpen={isModalOpen}

          onClose={handleModalClose}

          product={editingProduct}

          onSaved={handleSaved}

        />



        {deleteConfirmId && (

          <div

            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"

            onClick={() => setDeleteConfirmId(null)}

          >

            <div

              className="bg-surface-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"

              onClick={(e) => e.stopPropagation()}

            >

              <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">

                Confirm Delete

              </h3>

              <p className="font-body-md text-body-md text-on-surface-variant mb-6">

                Are you sure you want to delete this product? This action cannot be undone.

              </p>

              <div className="flex justify-end gap-3">

                <button

                  onClick={() => setDeleteConfirmId(null)}

                  className="px-4 py-2 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors"

                >

                  Cancel

                </button>

                <button

                  onClick={handleDeleteConfirm}

                  className="px-4 py-2 bg-error text-surface-white font-label-caps text-label-caps rounded hover:bg-error/90 transition-colors"

                >

                  Delete

                </button>

              </div>

            </div>

          </div>

        )}



        {bulkDeleteConfirm && (

          <div

            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"

            onClick={() => setBulkDeleteConfirm(false)}

          >

            <div

              className="bg-surface-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"

              onClick={(e) => e.stopPropagation()}

            >

              <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">

                Confirm Bulk Delete

              </h3>

              <p className="font-body-md text-body-md text-on-surface-variant mb-6">

                Are you sure you want to delete {selectedProducts.length} selected product(s)? This action cannot be undone.

              </p>

              <div className="flex justify-end gap-3">

                <button

                  onClick={() => setBulkDeleteConfirm(false)}

                  className="px-4 py-2 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors"

                >

                  Cancel

                </button>

                <button

                  onClick={handleBulkDelete}

                  className="px-4 py-2 bg-error text-surface-white font-label-caps text-label-caps rounded hover:bg-error/90 transition-colors"

                >

                  Delete {selectedProducts.length} Products

                </button>

              </div>

            </div>

          </div>

        )}

    </div>

  );

}
