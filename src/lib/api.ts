const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface PerfumeSize {
  size: string;
  priceEGP: number;
}

interface Perfume {
  id?: string; // UUID primary key
  _id?: string;
  nameEn: string;
  nameAr: string;
  brandEn: string;
  brandAr: string;
  categoryEn: string;
  categoryAr: string;
  genderEn: string;
  genderAr: string;
  descriptionEn: string;
  descriptionAr: string;
  sizes: PerfumeSize[];
  stockStatus: string;
  imageUrl?: string;
  isNew: boolean;
  isBestseller: boolean;
  isActive: boolean;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PerfumeListResponse {
  perfumes: Perfume[];
  pagination: Pagination;
}

// Perfume API calls
export const listPerfumes = async (params: {
  language?: string;
  brandFilter?: string;
  categoryFilter?: string;
  genderFilter?: string;
  stockStatusFilter?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}): Promise<PerfumeListResponse> => {
  const query = new URLSearchParams();
  if (params.language) query.append('language', params.language);
  if (params.brandFilter) query.append('brandFilter', params.brandFilter);
  if (params.categoryFilter) query.append('categoryFilter', params.categoryFilter);
  if (params.genderFilter) query.append('genderFilter', params.genderFilter);
  if (params.stockStatusFilter) query.append('stockStatusFilter', params.stockStatusFilter);
  if (params.searchTerm) query.append('searchTerm', params.searchTerm);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/perfumes/?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const getPerfumeById = async (id: string): Promise<Perfume | null> => {
  const timestamp = Date.now(); // Cache busting
  const response = await fetch(`${API_BASE_URL}/perfumes/${id}/?t=${timestamp}`);
  if (!response.ok) {
    return null;
  }
  const text = await response.text();
  if (!text) return null;
  const data = JSON.parse(text);
  if (!data) return null;

  // Map snake_case to camelCase and ensure isActive is always present (default to true if missing)
  return {
    ...data,
    isActive: data.isActive ?? data.is_active ?? true,
    isNew: data.isNew ?? data.is_new ?? false,
    isBestseller: data.isBestseller ?? data.is_bestseller ?? false,
  };
};

export const getBrands = async (language?: string): Promise<string[]> => {
  const query = new URLSearchParams();
  if (language) query.append('language', language);
  const response = await fetch(`${API_BASE_URL}/brands/?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const getCategories = async (language?: string): Promise<string[]> => {
  const query = new URLSearchParams();
  if (language) query.append('language', language);
  const response = await fetch(`${API_BASE_URL}/categories/?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// This function will be set by AdminContext to handle unauthorized responses
let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// Helper for authenticated API calls
const authenticatedFetch = async (
  url: string,
  options?: RequestInit,
): Promise<Response> => {
  const token = localStorage.getItem('admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    (headers as Record<string, string>).Authorization = `Token ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && onUnauthorizedCallback) {
    onUnauthorizedCallback();
    // Throw an error to stop further processing in the calling function
    throw new Error('Unauthorized: Token invalid or expired. Logging out.');
  }

  return response;
};


// Admin Perfume API calls (CRUD)
export const listAllPerfumes = async (params: {
  page?: number;
  limit?: number;
}): Promise<PerfumeListResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());

  const response = await authenticatedFetch(`${API_BASE_URL}/admin/perfumes/?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const createPerfume = async (perfumeData: Omit<Perfume, 'id'>): Promise<Perfume> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/admin/perfumes/`, {
    method: 'POST',
    body: JSON.stringify(perfumeData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const updatePerfume = async (
  id: string,
  perfumeData: Partial<Omit<Perfume, 'id'>>
): Promise<Perfume> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/admin/perfumes/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(perfumeData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const deletePerfume = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/admin/perfumes/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const updateAdminPassword = async (password: string): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/admin/update-password/`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
};

// Admin Auth API calls
export const loginAdmin = async (adminData: {
  password: string;
}): Promise<{ message: string; token: string } | null> => {
  const response = await fetch(`${API_BASE_URL}/admin/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(adminData),
  });

  if (response.ok) {
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('admin_token', data.token);
    }
    return data;
  } else if (response.status === 401) {
    return null;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
};

// Settings API calls
export const getSettings = async (): Promise<Record<string, string>> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/admin/settings/`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const updateSetting = async (key: string, value: string): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/admin/settings/`, {
    method: 'PUT',
    body: JSON.stringify({ key, value }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
};
