<script setup lang="ts">
    interface Category {
        id: number
        name: string
        type: 'INCOME' | 'EXPENSE'
        createdAt?: string
    }

    interface CategoriesResponse {
        success : boolean
        data: Category[]
    }

    const { apiFetch } = useApi()
    const categories = ref<Category[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const showCategoryModal = ref(false)
    const categoryName = ref('')
    const categoryType = ref<'INCOME' | 'EXPENSE' | ''>('')
    const saving = ref(false)
    const formError = ref<string | null>(null)
    const editingCategoryId = ref<number | null>(null)
    const showDeleteModal = ref(false)
    const categoryToDelete = ref<Category | null>(null)
    const deletingCategoryId = ref<number | null>(null)
    
    const delay = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))

    const fetchCategories = async () => {
        loading.value = true
        error.value = null

        const startTime = Date.now()

        try {
            const response = await apiFetch<CategoriesResponse>('/categories')
            categories.value = response.data
        } catch (err: any) {
            console.error('Categories error: ', err)

            error.value =
            err?.data?.message ?? 'Unable to load categories.'
        } finally {
            const elapsed = Date.now() - startTime
            const remaining = 1000 - elapsed

            if (remaining > 0) {
                await delay(remaining)
            }

            loading.value = false
        }
    }

    const createCategory = async () => {
        formError.value = null

        if (!categoryName.value || !categoryType.value) {
            formError.value = 'Category name and type are required.'
            return
        }

        saving.value = true

        try {

            if (editingCategoryId.value !== null) {
                // Update category
                await apiFetch(`/categories/${editingCategoryId.value}`, {
                    method: 'PUT',
                    body: {
                    name: categoryName.value,
                    type: categoryType.value
                    }
                })
            } else {
                // Create category
                await apiFetch('/categories', {
                method: 'POST',
                body: {
                    name: categoryName.value,
                    type: categoryType.value
                    }
                })
            }
           

            showCategoryModal.value = false
            editingCategoryId.value = null

            await fetchCategories()

        } catch (err: any) {
            console.error('Create category error:', err)

            formError.value =
            err?.data?.message ?? 'Unable to create category.'
        } finally {
            saving.value = false
        }
    }

    const deleteCategory = async () => {
        if (!categoryToDelete.value) return

        deletingCategoryId.value = categoryToDelete.value.id

        try {
            await apiFetch(`/categories/${categoryToDelete.value.id}`, {
            method: 'DELETE'
            })

            showDeleteModal.value = false
            categoryToDelete.value = null

            await fetchCategories()

        } catch (err: any) {
            console.error('Delete category error:', err)

            error.value =
            err?.data?.message ?? 'Unable to delete category.'
        } finally {
            deletingCategoryId.value = null
        }
    }

    const openCategoryModal = () => {
        editingCategoryId.value = null

        categoryName.value = ''
        categoryType.value = ''
        formError.value = null

        showCategoryModal.value = true
    }

    const closeCategoryModal = () => {
        if (saving.value) return

        showCategoryModal.value = false
    }

    const openEditCategoryModal = (category: Category) => {
        editingCategoryId.value = category.id

        categoryName.value = category.name
        categoryType.value = category.type

        formError.value = null
        showCategoryModal.value = true
    }

    const openDeleteCategoryModal = (category: Category) => {
        categoryToDelete.value = category
        showDeleteModal.value = true
    }

    const closeDeleteCategoryModal = () => {
        if (deletingCategoryId.value !== null) return

        showDeleteModal.value = false
        categoryToDelete.value = null
    }

    onMounted(() => {
        fetchCategories()
    })
</script>

<template>
  <div class="min-h-screen bg-gray-100">
      <!-- Page content -->
      <main class="p-4 sm:p-6 lg:p-8">
        <!-- Page heading -->
        <div class="mb-6 flex items-center justify-between">

          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Categories
            </h1>

            <p class="mt-1 text-sm text-gray-500">
              Manage your income and expense categories
            </p>
          </div>

          <button
            type="button"
            @click="openCategoryModal"
            class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            + Add Category
          </button>

        </div>

        <!-- Error -->
        <Toast
          v-if="error"
          :message="error"
          type="error"
          @close="error = null"
        />

        <!-- Loading -->
        <LoadingModal :show="loading" />

        <!-- Empty state -->
        <div
          v-if="!loading && categories.length === 0"
          class="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm"
        >
          <div class="text-4xl">
            🏷️
          </div>

          <h2 class="mt-4 text-lg font-semibold text-gray-900">
            No categories yet
          </h2>

          <p class="mt-1 text-sm text-gray-500">
            Create your first category to organize your transactions.
          </p>

          <button
            type="button"
            @click="openCategoryModal"
            class="mt-6 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            + Add Category
          </button>
        </div>

        <!-- Categories -->
        <div
          v-else
          class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >

          <div
            v-for="category in categories"
            :key="category.id"
            class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >

            <div class="flex items-start justify-between">

              <!-- Category information -->
              <div class="flex items-center gap-4">

                <div
                  class="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-xl"
                >
                  🏷️
                </div>

                <div>
                  <h2 class="font-semibold text-gray-900">
                    {{ category.name }}
                  </h2>

                  <span
                    class="mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="
                      category.type === 'INCOME'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    "
                  >
                    {{ category.type }}
                  </span>
                </div>

              </div>

              <!-- Actions -->
              <button
                type="button"
                @click="openEditCategoryModal(category)"
                class="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                Edit
              </button>

               <button
                    type="button"
                    @click="openDeleteCategoryModal(category)"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                    Delete
                </button>

            </div>

          </div>

        </div>

      </main>

  </div>
        <!-- Add Category Modal -->
    <div
        v-if="showCategoryModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        >
        <div class="w-full max-w-md rounded-xl bg-white shadow-xl">

            <!-- Header -->
            <div class="border-b border-gray-200 px-6 py-4">

            <h2 class="text-lg font-semibold text-gray-900">
                {{ editingCategoryId ? 'Edit Category' : 'Add Category' }}
            </h2>

            <p class="mt-1 text-sm text-gray-500">
                {{
                    editingCategoryId
                    ? 'Update your category information.'
                    : 'Create a category for your transactions.'
                }}
            </p>

            </div>

            <!-- Form -->
            <form
            class="space-y-5 px-6 py-6"
            @submit.prevent="createCategory"
            >

            <!-- Error -->
            <div
                v-if="formError"
                class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
            >
                {{ formError }}
            </div>

            <!-- Category Name -->
            <div>
                <label
                for="category-name"
                class="mb-2 block text-sm font-medium text-gray-700"
                >
                Category Name
                </label>

                <input
                id="category-name"
                v-model="categoryName"
                type="text"
                placeholder="e.g. Food"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
            </div>

            <!-- Category Type -->
            <div>
                <label
                for="category-type"
                class="mb-2 block text-sm font-medium text-gray-700"
                >
                Category Type
                </label>

                <select
                id="category-type"
                v-model="categoryType"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                <option value="">
                    Select category type
                </option>

                <option value="INCOME">
                    Income
                </option>

                <option value="EXPENSE">
                    Expense
                </option>
                </select>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3">

                <button
                type="button"
                @click="closeCategoryModal"
                :disabled="saving"
                class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                Cancel
                </button>

                <button
                type="submit"
                :disabled="saving"
                class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                {{
                saving
                    ? 'Saving...'
                    : editingCategoryId
                    ? 'Save Changes'
                    : 'Add Category'
                }}
                </button>

            </div>

            </form>

        </div>
    </div>


    <!-- Delete Category Modal -->
    <div
    v-if="showDeleteModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
    <div class="w-full max-w-md rounded-xl bg-white shadow-xl">

        <!-- Content -->
        <div class="px-6 py-6">

        <div class="flex items-start gap-4">

            <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-xl"
            >
            🗑️
            </div>

            <div>
            <h2 class="text-lg font-semibold text-gray-900">
                Delete Category
            </h2>

            <p class="mt-2 text-sm text-gray-500">
                Are you sure you want to delete
                <span class="font-medium text-gray-900">
                {{ categoryToDelete?.name }}
                </span>?
            </p>

            <p class="mt-1 text-xs text-gray-400">
                This action cannot be undone.
            </p>
            </div>

        </div>

        <!-- Actions -->
        <div class="mt-6 flex justify-end gap-3">

            <button
            type="button"
            @click="closeDeleteCategoryModal"
            :disabled="deletingCategoryId !== null"
            class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
            Cancel
            </button>

            <button
            type="button"
            @click="deleteCategory"
            :disabled="deletingCategoryId !== null"
            class="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
            {{
                deletingCategoryId !== null
                ? 'Deleting...'
                : 'Delete Category'
            }}
            </button>

        </div>

        </div>

    </div>
    </div>
</template>