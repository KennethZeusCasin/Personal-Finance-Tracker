<script setup lang="ts">
    interface Account {
        id : number
        name : string
        type : string
        balance : number | string
        createdAt : string
    }

    interface AccountsResponse {
        success : boolean
        data : Account[]
    }

    const { apiFetch } = useApi()
    const accounts = ref<Account[]>([])
    const loading = ref(false)
    const error = ref<string | null> (null)
    const showAddModal = ref(false)

    const accountName = ref('')

    type AccountType =
        | 'CASH'
        | 'BANK'
        | 'E_WALLET'
        | 'CREDIT_CARD'
        | 'OTHER'

    const accountType = ref<AccountType | ''>('')
    const editingAccountId = ref<number | null>(null)
    const deletingAccountId = ref<number | null>(null)
    const showDeleteModal = ref(false)
    const accountToDelete = ref<Account | null>(null)

    const saving = ref(false)
    const formError = ref<string | null>(null)

    const fetchAccounts = async () => {
        loading.value = true
        error.value = null

        try {
            const response = await apiFetch<AccountsResponse>('/accounts')

            accounts.value = response.data
        } catch (err) {
            console.error('Accounts error : ', err)
            
            error.value = "Unable to load accounts."
        } finally {
            loading.value = false
        }
    }

    const openAddModal = () => {
        editingAccountId.value = null
        accountName.value = ''
        accountType.value = ''
        formError.value = null
        showAddModal.value = true
    }

    const closeAddModal = () => {
        if (saving.value) return

        showAddModal.value = false
    }

    const openEditModal = (account: Account) => {
        editingAccountId.value = account.id

        accountName.value = account.name
        accountType.value = account.type as AccountType

        formError.value = null
        showAddModal.value = true
    }

    const openDeleteModal = (account: Account) => {
        accountToDelete.value = account
        showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
        if (deletingAccountId.value) return

        showDeleteModal.value = false
        accountToDelete.value = null
    }

    const createAccount = async () => {
        formError.value = null

        if (!accountName.value || !accountType.value) {
            formError.value = 'Account name and type are required.'
            return
        }

        saving.value = true

        try {
            if(editingAccountId.value){
                // edit exisiting account
                await apiFetch(`/accounts/${editingAccountId.value}`, {
                    method: 'PUT',
                    body: {
                        name: accountName.value,
                        type: accountType.value
                    }
                })
            }else{
                // create new account
                await apiFetch('/accounts', {
                    method: 'POST',
                    body: {
                        name: accountName.value,
                        type: accountType.value
                    }
                })
            }

            showAddModal.value = false

            editingAccountId.value = null

            await fetchAccounts()

        } catch (err: any) {
            console.error('Create account error:', err)

            formError.value =
            err?.data?.message ?? 'Unable to save account.'
        } finally {
            saving.value = false
        }
    }

    const deleteAccount = async () => {
        if (!accountToDelete.value) return

        deletingAccountId.value = accountToDelete.value.id

        try {
            await apiFetch(`/accounts/${accountToDelete.value.id}`, {
            method: 'DELETE'
            })

            showDeleteModal.value = false
            accountToDelete.value = null

            await fetchAccounts()

        } catch (err: any) {
            console.error('Delete account error:', err)

            error.value =
            err?.data?.message ?? 'Unable to delete account.'
        } finally {
            deletingAccountId.value = null
        }
    }

    onMounted(() => {
        fetchAccounts()
    })
</script>

<template>
  <div class="min-h-screen bg-gray-100">

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white lg:block"
    >
      <div class="flex h-full flex-col">

        <!-- Logo -->
        <div class="flex h-16 items-center border-b border-gray-200 px-6">
          <h1 class="text-xl font-bold text-gray-900">
            Finance Tracker
          </h1>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-1 px-4 py-6">

          <NuxtLink
            to="/dashboard"
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            <span>📊</span>
            Dashboard
          </NuxtLink>

          <NuxtLink
            to="/accounts"
            class="flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white"
          >
            <span>💳</span>
            Accounts
          </NuxtLink>

          <NuxtLink
            to="/categories"
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            <span>🏷️</span>
            Categories
          </NuxtLink>

          <NuxtLink
            to="/transactions"
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            <span>💸</span>
            Transactions
          </NuxtLink>

        </nav>

        <!-- Bottom -->
        <div class="border-t border-gray-200 p-4">

          <button
            class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            <span>⚙️</span>
            Settings
          </button>

          <button
            class="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <span>🚪</span>
            Logout
          </button>

        </div>

      </div>
    </aside>

    <!-- Main -->
    <div class="lg:pl-64">

      <!-- Header -->
      <header class="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

          <h2 class="text-lg font-semibold text-gray-900">
            Accounts
          </h2>

          <div class="flex items-center gap-3">

            <button
              class="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
            >
              🔔
            </button>

            <div class="flex items-center gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white"
              >
                K
              </div>

              <div class="hidden sm:block">
                <p class="text-sm font-medium text-gray-900">
                  Kenneth
                </p>

                <p class="text-xs text-gray-500">
                  Personal Account
                </p>
              </div>
            </div>

          </div>

        </div>
      </header>

      <!-- Content -->
      <main class="p-4 sm:p-6 lg:p-8">

        <!-- Page heading -->
        <div class="mb-6 flex items-center justify-between">

          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              My Accounts
            </h1>

            <p class="mt-1 text-sm text-gray-500">
              Manage your bank accounts, wallets, and other financial accounts.
            </p>
          </div>

        <button
            type="button"
            @click="openAddModal"
            class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
            + Add Account
        </button>

        </div>

        <!-- Error -->
        <LoadingModal :show="loading" />

        <Toast
          v-if="error"
          :message="error"
          type="error"
          @close="error = null"
        />

        <!-- Accounts -->
        <div
          v-else
          class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >

          <div
            v-for="account in accounts"
            :key="account.id"
            class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >

            <div class="flex items-start justify-between">

              <div class="flex items-center gap-3">

                <div
                  class="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-xl"
                >
                  💳
                </div>

                <div>
                  <h2 class="font-semibold text-gray-900">
                    {{ account.name }}
                  </h2>

                  <p class="text-xs text-gray-500">
                    {{ account.type }}
                  </p>
                </div>

              </div>
               <div class="flex items-center gap-2">

                    <button
                        type="button"
                        @click="openEditModal(account)"
                        class="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        @click="openDeleteModal(account)"
                        class="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                        Delete
                    </button>

                </div>

            </div>

            <div class="mt-6">

              <p class="text-xs font-medium text-gray-500">
                Current Balance
              </p>

              <p class="mt-1 text-2xl font-bold text-gray-900">
                ₱{{
                  Number(account.balance).toLocaleString('en-PH', {
                    minimumFractionDigits: 2
                  })
                }}
              </p>

            </div>

          </div>

          <!-- Empty -->
          <div
            v-if="accounts.length === 0 && !loading"
            class="col-span-full rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center"
          >
            <div class="text-4xl">
              💳
            </div>

            <h3 class="mt-4 font-semibold text-gray-900">
              No accounts yet
            </h3>

            <p class="mt-1 text-sm text-gray-500">
              Add your first account to start tracking your finances.
            </p>

            <button
                type="button"
                @click="openAddModal"
                class="mt-5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
            + Add Account
            </button>
          </div>

        </div>

      </main>

    </div>
    
    <!-- Add Account Modal -->
    <div
    v-if="showAddModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    @click.self="closeAddModal"
    >
    <div
        class="w-full max-w-md rounded-xl bg-white shadow-xl"
    >

        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">

        <div>
            <h2 class="text-lg font-semibold text-gray-900">
                {{ editingAccountId ? 'Edit Account' : 'Add Account' }}
            </h2>

            <p class="mt-1 text-sm text-gray-500">
                {{ editingAccountId
                    ? 'Update your account information.'
                    : 'Add a new financial account.'
                }}
            </p>
        </div>

        <button
            type="button"
            @click="closeAddModal"
            class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
            ✕
        </button>

        </div>

        <!-- Modal Body -->
        <form
        class="space-y-5 p-6"
        @submit.prevent="createAccount"
        >

        <!-- Error -->
        <div
            v-if="formError"
            class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
        >
            {{ formError }}
        </div>

        <!-- Account Name -->
        <div>
            <label
                for="account-name"
                class="mb-2 block text-sm font-medium text-gray-700"
            >
            Account Name
            </label>

            <input
            id="account-name"
            v-model="accountName"
            type="text"
            placeholder="e.g. BDO Savings"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
        </div>

        <!-- Account Type -->
        <div>
            <label
            for="account-type"
            class="mb-2 block text-sm font-medium text-gray-700"
            >
            Account Type
            </label>

            <select
                id="account-type"
                v-model="accountType"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            >
                <option value="" disabled class="text-gray-400">
                    Select account type
                </option>

                <option value="BANK">Bank</option>
                <option value="CASH">Cash</option>
                <option value="E_WALLET">E-Wallet</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="INVESTMENT">Investment</option>
            </select>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-3 pt-2">

            <button
            type="button"
            @click="closeAddModal"
            :disabled="saving"
            class="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
            Cancel
            </button>

            <button
            type="submit"
            :disabled="saving"
            class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
            {{ saving
                ? 'Saving...'
                : editingAccountId
                    ? 'Save Changes'
                    : 'Add Account'
            }}
            </button>

        </div>

        </form>

    </div>
    </div>

    </div>

    <!-- Delete Account Modal -->
    <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

        <div class="flex items-start gap-4">

        <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl"
        >
            ⚠️
        </div>

        <div>
            <h2 class="text-lg font-semibold text-gray-900">
            Delete Account?
            </h2>

            <p class="mt-1 text-sm text-gray-500">
            Are you sure you want to delete
            <span class="font-medium text-gray-900">
                {{ accountToDelete?.name }}
            </span>?
            This action cannot be undone.
            </p>
        </div>

        </div>

        <div class="mt-6 flex justify-end gap-3">

        <button
            type="button"
            @click="closeDeleteModal"
            :disabled="!!deletingAccountId"
            class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
            Cancel
        </button>

        <button
            type="button"
            @click="deleteAccount"
            :disabled="!!deletingAccountId"
            class="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {{
            deletingAccountId
                ? 'Deleting...'
                : 'Delete Account'
            }}
        </button>

        </div>

    </div>
    </div>
</template>