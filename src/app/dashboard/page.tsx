'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiPackage, 
  FiPlay, 
  FiTag, 
  FiDollarSign, 
  FiPause, 
  FiPlayCircle,
  FiLogOut,
  FiUser,
  FiShoppingBag,
  FiAward,
  FiBarChart2,
  FiClock,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/shop-service';
import { productService } from '@/services/product-service';
import { paymentService } from '@/services/payment-service';
import { uploadService } from '@/services/upload-service';
import Logo from '@/components/Logo';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import styles from './dashboard.module.css';

interface Raffle {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    value: number;
  };
  totalTickets: number;
  soldTickets: number;
  status: string;
  createdAt: string | Date;
  productValue?: number;
  winnerTicketId?: string;
  raffleExecutedAt?: string | Date;
}

interface RaffleTicket {
  id: string;
  raffleId: string;
  number: number;
  status: string;
  purchasedAt?: string;
}

interface Deposit {
  id: string;
  raffleId: string;
  amount: number;
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout, isHydrated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [myShop, setMyShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [tickets, setTickets] = useState<RaffleTicket[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'raffles' | 'tickets' | 'deposits' | 'pending'>('overview');
  const [pendingRaffles, setPendingRaffles] = useState<Raffle[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [showRaffleDetail, setShowRaffleDetail] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approvingRaffle, setApprovingRaffle] = useState<string | null>(null);
  const [rejectingRaffle, setRejectingRaffle] = useState<string | null>(null);
  const [activeRaffles, setActiveRaffles] = useState<Raffle[]>([]);
  const [myTickets, setMyTickets] = useState<RaffleTicket[]>([]);
  const [buyingTickets, setBuyingTickets] = useState<string | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState<{ [raffleId: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [creatingRaffle, setCreatingRaffle] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [formData, setFormData] = useState({
    shopId: '',
    productId: '',
    specialConditions: '',
  });
  const [productFormData, setProductFormData] = useState({
    shopId: '',
    name: '',
    description: '',
    value: 0,
    height: 0,
    width: 0,
    depth: 0,
    category: '',
    mainImage: '',
  });
  const [dimensionErrors, setDimensionErrors] = useState<string[]>([]);
  const [, setProductImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pausingRaffle, setPausingRaffle] = useState<string | null>(null);
  const [resumingRaffle, setResumingRaffle] = useState<string | null>(null);
  const [submittingRaffle, setSubmittingRaffle] = useState<string | null>(null);

  // Función helper para cargar sorteos pendientes desde Firestore
  const loadPendingRaffles = async () => {
    try {
      const { collection, query, getDocs, doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const rafflesRef = collection(db, 'raffles');
      
      // Obtener todos los sorteos y filtrar en memoria (más confiable, no requiere índices)
      const allSnapshot = await getDocs(query(rafflesRef));
      console.log('📊 Total sorteos en la base de datos:', allSnapshot.docs.length);
      
      // Mostrar todos los status encontrados para debugging
      const statusCounts: { [key: string]: number } = {};
      allSnapshot.docs.forEach(doc => {
        const status = doc.data().status || 'sin-status';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      console.log('📊 Status encontrados en todos los sorteos:', statusCounts);
      
      // Filtrar sorteos pendientes (aceptar diferentes variantes)
      const pendingVariants = ['pending_approval', 'Pendiente de Aprobación', 'pending', 'Pendiente'];
      const pendingDocs = allSnapshot.docs.filter(doc => {
        const status = doc.data().status || '';
        const statusLower = status.toLowerCase();
        // Buscar coincidencias exactas o parciales
        return pendingVariants.some(variant => {
          const variantLower = variant.toLowerCase();
          return statusLower === variantLower || statusLower.includes('pending') || statusLower.includes('pendiente');
        });
      });
      
      console.log('📊 Sorteos pendientes encontrados después de filtrar:', pendingDocs.length);
      
      if (pendingDocs.length === 0) {
        console.warn('⚠️ No se encontraron sorteos pendientes. Verifica que los sorteos tengan status "pending_approval" en Firestore.');
      }
      
      const pending: Raffle[] = [];
      
      for (const docSnap of pendingDocs) {
        const data = docSnap.data();
        console.log('🔍 Sorteo encontrado:', {
          id: docSnap.id,
          status: data.status,
          productId: data.productId,
          createdAt: data.createdAt
        });
        let product = null;
        if (data.productId) {
          try {
            const productDoc = await getDoc(doc(db, 'products', data.productId));
            if (productDoc.exists()) {
              const productData = productDoc.data();
              product = {
                id: productDoc.id,
                name: productData.name || '',
                value: productData.value || 0,
              };
            }
          } catch (err) {
            console.log('Error loading product:', err);
          }
        }
        
        const createdAt = data.createdAt?.toDate() || new Date();
        
        pending.push({
          id: docSnap.id,
          productId: data.productId || '',
          product: product || undefined,
          totalTickets: data.totalTickets || 0,
          soldTickets: data.soldTickets || 0,
          status: data.status || 'draft',
          createdAt: createdAt.toISOString(),
          productValue: data.productValue || 0,
          winnerTicketId: data.winnerTicketId,
          raffleExecutedAt: data.raffleExecutedAt?.toDate()?.toISOString(),
        });
      }
      
      // Ordenar por fecha de creación descendente en memoria
      pending.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      console.log('✅ Sorteos pendientes cargados:', pending.length);
      console.log('📋 IDs de sorteos pendientes:', pending.map(r => r.id));
      return pending;
    } catch (err: any) {
      console.error('Error loading pending raffles:', err);
      // Si el error es por índice faltante, intentar sin orderBy
      if (err.code === 'failed-precondition' || err.message?.includes('index')) {
        console.log('⚠️ Índice faltante, intentando sin orderBy...');
        try {
          const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const rafflesRef = collection(db, 'raffles');
          const pendingQuery = query(rafflesRef, where('status', '==', 'pending_approval'));
          const pendingSnapshot = await getDocs(pendingQuery);
          const pending: Raffle[] = [];
          
          for (const docSnap of pendingSnapshot.docs) {
            const data = docSnap.data();
            let product = null;
            if (data.productId) {
              try {
                const productDoc = await getDoc(doc(db, 'products', data.productId));
                if (productDoc.exists()) {
                  const productData = productDoc.data();
                  product = {
                    id: productDoc.id,
                    name: productData.name || '',
                    value: productData.value || 0,
                  };
                }
              } catch (err) {
                console.log('Error loading product:', err);
              }
            }
            
            const createdAt = data.createdAt?.toDate() || new Date();
            pending.push({
              id: docSnap.id,
              productId: data.productId || '',
              product: product || undefined,
              totalTickets: data.totalTickets || 0,
              soldTickets: data.soldTickets || 0,
              status: data.status || 'draft',
              createdAt: createdAt.toISOString(),
              productValue: data.productValue || 0,
              winnerTicketId: data.winnerTicketId,
              raffleExecutedAt: data.raffleExecutedAt?.toDate()?.toISOString(),
            });
          }
          
          pending.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
          
          return pending;
        } catch (retryErr) {
          console.error('Error en reintento:', retryErr);
          return [];
        }
      }
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isHydrated) {
        return;
      }

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // El usuario ya está en el store desde Firebase Auth
        if (!user) {
          router.push('/login');
          return;
        }

        // Fetch shops first
        let shopsData: Shop[] = [];
        let currentShop: Shop | null = null;
        
        // Si el usuario tiene rol shop, obtener su tienda desde Firestore
        if (user.role === 'shop') {
          try {
            console.log('🛒 Obteniendo tienda para usuario con rol shop...');
            // Buscar tienda por userId en Firestore
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');
            const shopsRef = collection(db, 'shops');
            const q = query(shopsRef, where('userId', '==', user.id));
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
              const shopDoc = snapshot.docs[0];
              const shopData = shopDoc.data();
              currentShop = {
                id: shopDoc.id,
                userId: shopData.userId || user.id,
                name: shopData.name || '',
                description: shopData.description,
                logo: shopData.logo,
                publicEmail: shopData.publicEmail,
                phone: shopData.phone,
                socialMedia: shopData.socialMedia,
                status: shopData.status || 'pending',
                createdAt: shopData.createdAt?.toDate() || new Date(),
                updatedAt: shopData.updatedAt?.toDate() || new Date(),
              } as Shop;
              
              console.log('✅ Tienda obtenida:', currentShop);
              setMyShop(currentShop);
              shopsData = [currentShop];
              setShops(shopsData);
              // Establecer shopId inmediatamente
              setFormData(prev => ({ ...prev, shopId: currentShop!.id }));
              setProductFormData(prev => ({ ...prev, shopId: currentShop!.id }));
            } else {
              console.log('⚠️ No se encontró tienda para este usuario');
            }
          } catch (err: any) {
            console.error('❌ Error obteniendo tienda del usuario:', err);
            setError('Error al obtener tu tienda. Por favor, recarga la página.');
          }
        } else {
          // Para otros roles, obtener todas las tiendas desde Firestore
          try {
            shopsData = await shopService.getAllShops();
            setShops(shopsData);
          } catch (err) {
            console.log('No shops found');
          }
        }

        // Fetch products - filter by shops if available
        try {
          if (shopsData.length > 0) {
            // Si el usuario tiene tiendas, obtener productos de todas sus tiendas
            const allProducts: Product[] = [];
            for (const shop of shopsData) {
              try {
                const products = await productService.getProductsByShop(shop.id);
                allProducts.push(...products);
              } catch (err) {
                console.log(`No products found for shop ${shop.id}`);
              }
            }
            setProducts(allProducts);
          } else {
            // Si no tiene tiendas, intentar obtener todos los productos
            try {
              const allProducts = await productService.getAllProducts();
              setProducts(allProducts);
            } catch (err) {
              console.log('No products found');
            }
          }
        } catch (err) {
          console.log('No products found');
        }

        // Fetch raffles desde Firestore
        try {
          if (user.role === 'admin') {
            // Para admin, obtener sorteos pendientes de aprobación
            const pending = await loadPendingRaffles();
            setPendingRaffles(pending);
            
            // Obtener todos los sorteos
            const { raffleService } = await import('@/services/raffle-service');
            const allRaffles = await raffleService.getAllRaffles();
            setRaffles(allRaffles.map((r: any) => ({
              ...r,
              createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
              raffleExecutedAt: r.raffleExecutedAt instanceof Date ? r.raffleExecutedAt.toISOString() : r.raffleExecutedAt,
            })));
          } else {
            // Para shop/user, obtener sorteos desde Firestore
            const { raffleService } = await import('@/services/raffle-service');
            const allRaffles = await raffleService.getAllRaffles();
            setRaffles(allRaffles.map((r: any) => ({
              ...r,
              createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
              raffleExecutedAt: r.raffleExecutedAt instanceof Date ? r.raffleExecutedAt.toISOString() : r.raffleExecutedAt,
            })));
            
            // Si es usuario normal, mostrar todos los sorteos (no solo activos)
            if (user.role === 'user') {
              const visibleRaffles = allRaffles.filter((r: any) => 
                r.status !== 'draft' && r.status !== 'rejected'
              );
              setActiveRaffles(visibleRaffles.map((r: any) => ({
                ...r,
                createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
                raffleExecutedAt: r.raffleExecutedAt instanceof Date ? r.raffleExecutedAt.toISOString() : r.raffleExecutedAt,
              })));
            }
          }
        } catch (err) {
          console.log('No raffles found:', err);
        }

        // Fetch tickets - por ahora vacío hasta implementar en Firestore
        // TODO: Implementar carga de tickets desde Firestore
        try {
          if (user.role === 'user') {
            setMyTickets([]);
          } else {
            setTickets([]);
          }
        } catch (err) {
          console.log('No tickets found');
        }

        // Fetch deposits - por ahora vacío hasta implementar en Firestore
        // TODO: Implementar carga de depósitos desde Firestore
        try {
          setDeposits([]);
        } catch (err) {
          console.log('No deposits found');
        }

        // Set shopId in forms if user has shops
        if (currentShop) {
          setFormData(prev => ({ ...prev, shopId: currentShop.id }));
          setProductFormData(prev => ({ ...prev, shopId: currentShop.id }));
        } else if (shopsData.length > 0) {
          setFormData(prev => ({ ...prev, shopId: shopsData[0].id }));
          setProductFormData(prev => ({ ...prev, shopId: shopsData[0].id }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos');
        logout();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isHydrated, token]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      router.push('/');
    }
  };

  const handleOpenModal = () => {
    // Si el usuario tiene una tienda (rol shop), usar esa tienda automáticamente
    if (myShop) {
      setFormData(prev => ({ ...prev, shopId: myShop.id }));
    } else if (shops.length > 0) {
      setFormData(prev => ({ ...prev, shopId: shops[0].id }));
    }
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
      shopId: '',
      productId: '',
      specialConditions: '',
    });
  };

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shopId || !formData.productId) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setCreatingRaffle(true);
    try {
      const { raffleService } = await import('@/services/raffle-service');
      const newRaffle = await raffleService.createRaffle({
        shopId: formData.shopId,
        productId: formData.productId,
        specialConditions: formData.specialConditions || undefined,
      });

      // Convertir el Raffle de Firebase al formato del dashboard
      const dashboardRaffle: Raffle = {
        ...newRaffle,
        createdAt: newRaffle.createdAt instanceof Date ? newRaffle.createdAt.toISOString() : newRaffle.createdAt,
        raffleExecutedAt: newRaffle.raffleExecutedAt instanceof Date ? newRaffle.raffleExecutedAt.toISOString() : newRaffle.raffleExecutedAt,
      };

      setRaffles([...raffles, dashboardRaffle]);
      handleCloseModal();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al crear el sorteo');
    } finally {
      setCreatingRaffle(false);
    }
  };

  const validateDimensions = (height: number, width: number, depth: number): string[] => {
    const errors: string[] = [];
    const MAX_DIMENSION = 15;

    if (height <= 0) errors.push('La altura debe ser mayor a 0');
    if (width <= 0) errors.push('El ancho debe ser mayor a 0');
    if (depth <= 0) errors.push('La profundidad debe ser mayor a 0');

    if (height > MAX_DIMENSION) errors.push(`La altura no puede exceder ${MAX_DIMENSION}cm`);
    if (width > MAX_DIMENSION) errors.push(`El ancho no puede exceder ${MAX_DIMENSION}cm`);
    if (depth > MAX_DIMENSION) errors.push(`La profundidad no puede exceder ${MAX_DIMENSION}cm`);

    return errors;
  };

  const handleDimensionChange = (field: 'height' | 'width' | 'depth', value: string) => {
    const numValue = parseFloat(value) || 0;
    setProductFormData((prev) => ({ ...prev, [field]: numValue }));

    const height = field === 'height' ? numValue : productFormData.height;
    const width = field === 'width' ? numValue : productFormData.width;
    const depth = field === 'depth' ? numValue : productFormData.depth;

    const errors = validateDimensions(height, width, depth);
    setDimensionErrors(errors);
  };

  const handleOpenProductModal = async () => {
    // Si el usuario tiene rol shop pero no tiene tienda cargada, intentar obtenerla desde Firestore
    if (user?.role === 'shop' && !myShop) {
      try {
        // Buscar tienda por userId en Firestore
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const shopsRef = collection(db, 'shops');
        const q = query(shopsRef, where('userId', '==', user.id));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const shopDoc = snapshot.docs[0];
          const shopData = shopDoc.data();
          const shop = {
            id: shopDoc.id,
            userId: shopData.userId || user.id,
            name: shopData.name || '',
            description: shopData.description,
            logo: shopData.logo,
            publicEmail: shopData.publicEmail,
            phone: shopData.phone,
            socialMedia: shopData.socialMedia,
            status: shopData.status || 'pending',
            createdAt: shopData.createdAt?.toDate() || new Date(),
            updatedAt: shopData.updatedAt?.toDate() || new Date(),
          } as Shop;
          
          setMyShop(shop);
          setShops([shop]);
          setProductFormData(prev => ({ ...prev, shopId: shop.id }));
        }
      } catch (err: any) {
        console.error('Error obteniendo tienda al abrir modal:', err);
        setError('No se pudo obtener la información de tu tienda. Por favor, recarga la página.');
        return;
      }
    } else if (myShop) {
      // Si el usuario tiene una tienda (rol shop), usar esa tienda automáticamente
      setProductFormData(prev => ({ ...prev, shopId: myShop.id }));
    } else if (shops.length > 0) {
      setProductFormData(prev => ({ ...prev, shopId: shops[0].id }));
    }
    setShowCreateProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowCreateProductModal(false);
    setProductFormData({
      shopId: shops.length > 0 ? shops[0].id : '',
      name: '',
      description: '',
      value: 0,
      height: 0,
      width: 0,
      depth: 0,
      category: '',
      mainImage: '',
    });
    setDimensionErrors([]);
    setProductImageFile(null);
  };

  const handlePauseRaffle = async (raffleId: string) => {
    setPausingRaffle(raffleId);
    setError(null);
    try {
      // TODO: Implementar pausar sorteo en Firebase
      setError('Función de pausar sorteo aún no implementada en Firebase');
    } catch (err: any) {
      setError(err.message || 'Error al pausar el sorteo');
    } finally {
      setPausingRaffle(null);
    }
  };

  const handleResumeRaffle = async (raffleId: string) => {
    setResumingRaffle(raffleId);
    setError(null);
    try {
      // TODO: Implementar reanudar sorteo en Firebase
      setError('Función de reanudar sorteo aún no implementada en Firebase');
    } catch (err: any) {
      setError(err.message || 'Error al reanudar el sorteo');
    } finally {
      setResumingRaffle(null);
    }
  };

  const handleSubmitForApproval = async (raffleId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas enviar este sorteo a aprobación? Una vez enviado, no podrás editarlo hasta que sea aprobado o rechazado.')) {
      return;
    }

    setSubmittingRaffle(raffleId);
    setError(null);
    try {
      const { raffleService } = await import('@/services/raffle-service');
      const updatedRaffle = await raffleService.submitForApproval(raffleId);
      const dashboardRaffle: Raffle = {
        ...updatedRaffle,
        createdAt: updatedRaffle.createdAt instanceof Date ? updatedRaffle.createdAt.toISOString() : updatedRaffle.createdAt,
        raffleExecutedAt: updatedRaffle.raffleExecutedAt instanceof Date ? updatedRaffle.raffleExecutedAt.toISOString() : updatedRaffle.raffleExecutedAt,
      };
      setRaffles(raffles.map(r => r.id === raffleId ? dashboardRaffle : r));
      // Si el admin está viendo, recargar sorteos pendientes desde Firestore
      if (user?.role === 'admin') {
        const pending = await loadPendingRaffles();
        setPendingRaffles(pending);
      }
    } catch (err: any) {
      setError(err.message || 'Error al enviar el sorteo a aprobación');
    } finally {
      setSubmittingRaffle(null);
    }
  };

  const handleViewRaffleDetail = async (raffleId: string) => {
    try {
      // Obtener sorteo desde Firestore
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
      
      if (!raffleDoc.exists()) {
        setError('Sorteo no encontrado');
        return;
      }
      
      const data = raffleDoc.data();
      let product = null;
      if (data.productId) {
        try {
          const productDoc = await getDoc(doc(db, 'products', data.productId));
          if (productDoc.exists()) {
            const productData = productDoc.data();
            product = {
              id: productDoc.id,
              name: productData.name || '',
              value: productData.value || 0,
            };
          }
        } catch (err) {
          console.log('Error loading product:', err);
        }
      }
      
      const raffle: Raffle = {
        id: raffleDoc.id,
        productId: data.productId || '',
        product: product || undefined,
        totalTickets: data.totalTickets || 0,
        soldTickets: data.soldTickets || 0,
        status: data.status || 'draft',
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        productValue: data.productValue || 0,
        winnerTicketId: data.winnerTicketId,
        raffleExecutedAt: data.raffleExecutedAt?.toDate()?.toISOString(),
      };
      
      setSelectedRaffle(raffle);
      setShowRaffleDetail(true);
    } catch (err: any) {
      setError(err.message || 'Error al cargar detalles del sorteo');
    }
  };

  const handleApproveRaffle = async (raffleId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas aprobar este sorteo?')) return;

    setApprovingRaffle(raffleId);
    setError(null);
    try {
      // Actualizar sorteo en Firestore
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const raffleRef = doc(db, 'raffles', raffleId);
      
      await updateDoc(raffleRef, {
        status: 'active',
        updatedAt: serverTimestamp(),
        activatedAt: serverTimestamp(),
      });
      
      setPendingRaffles(pendingRaffles.filter(r => r.id !== raffleId));
      setShowRaffleDetail(false);
      setSelectedRaffle(null);
      
      // Recargar sorteos pendientes
      const pending = await loadPendingRaffles();
      setPendingRaffles(pending);
      
      // Recargar todos los sorteos para actualizar el estado
      const { raffleService } = await import('@/services/raffle-service');
      const allRaffles = await raffleService.getAllRaffles();
      setRaffles(allRaffles.map((r: any) => ({
        ...r,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        raffleExecutedAt: r.raffleExecutedAt instanceof Date ? r.raffleExecutedAt.toISOString() : r.raffleExecutedAt,
      })));
    } catch (err: any) {
      setError(err.message || 'Error al aprobar el sorteo');
    } finally {
      setApprovingRaffle(null);
    }
  };

  const handleRejectRaffle = async (raffleId: string) => {
    if (!rejectReason.trim()) {
      setError('Por favor ingresa un motivo de rechazo');
      return;
    }

    setRejectingRaffle(raffleId);
    setError(null);
    try {
      // Actualizar sorteo en Firestore
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const raffleRef = doc(db, 'raffles', raffleId);
      
      await updateDoc(raffleRef, {
        status: 'rejected',
        updatedAt: serverTimestamp(),
        rejectReason: rejectReason.trim(),
      });
      
      setPendingRaffles(pendingRaffles.filter(r => r.id !== raffleId));
      setShowRejectModal(false);
      setShowRaffleDetail(false);
      setRejectReason('');
      setSelectedRaffle(null);
      
      // Recargar sorteos pendientes
      const pending = await loadPendingRaffles();
      setPendingRaffles(pending);
      
      // Recargar todos los sorteos para actualizar el estado
      const { raffleService } = await import('@/services/raffle-service');
      const allRaffles = await raffleService.getAllRaffles();
      setRaffles(allRaffles.map((r: any) => ({
        ...r,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        raffleExecutedAt: r.raffleExecutedAt instanceof Date ? r.raffleExecutedAt.toISOString() : r.raffleExecutedAt,
      })));
    } catch (err: any) {
      setError(err.message || 'Error al rechazar el sorteo');
    } finally {
      setRejectingRaffle(null);
    }
  };

  const handleBuyTickets = async (raffleId: string) => {
    const quantity = ticketQuantity[raffleId] || 1;
    const raffle = activeRaffles.find(r => r.id === raffleId);
    
    if (!raffle) {
      setError('Sorteo no encontrado');
      return;
    }

    const availableTickets = raffle.totalTickets - raffle.soldTickets;
    if (quantity > availableTickets) {
      setError(`Solo hay ${availableTickets} tickets disponibles`);
      return;
    }

    if (quantity < 1) {
      setError('Debes comprar al menos 1 ticket');
      return;
    }

    setBuyingTickets(raffleId);
    setError(null);

    try {
      const productValue = raffle.productValue || raffle.product?.value || 0;
      const totalPrice = quantity * productValue;

      const payment = await paymentService.createPayment({
        raffleId: raffle.id,
        amount: totalPrice,
        ticketQuantity: quantity,
      });

      // Redirigir a checkout
      router.push(`/checkout?paymentId=${payment.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la compra. Intenta de nuevo.');
      setBuyingTickets(null);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WEBP, GIF)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo permitido: 5MB');
      return;
    }

    setProductImageFile(file);
    setError(null);

    // Subir imagen automáticamente
    setUploadingImage(true);
    try {
      const fileUrl = await uploadService.uploadProductImage(file);
      setProductFormData(prev => ({ ...prev, mainImage: fileUrl }));
      // Construir URL completa para mostrar preview
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${fileUrl}`;
      setProductFormData(prev => ({ ...prev, mainImage: fullUrl }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al subir la imagen');
      setProductImageFile(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Si el usuario tiene rol shop pero no tiene shopId, intentar obtener la tienda desde Firestore
    if (!productFormData.shopId && user?.role === 'shop') {
      try {
        // Buscar tienda por userId en Firestore
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const shopsRef = collection(db, 'shops');
        const q = query(shopsRef, where('userId', '==', user.id));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const shopDoc = snapshot.docs[0];
          const shopData = shopDoc.data();
          const shop = {
            id: shopDoc.id,
            userId: shopData.userId || user.id,
            name: shopData.name || '',
            description: shopData.description,
            logo: shopData.logo,
            publicEmail: shopData.publicEmail,
            phone: shopData.phone,
            socialMedia: shopData.socialMedia,
            status: shopData.status || 'pending',
            createdAt: shopData.createdAt?.toDate() || new Date(),
            updatedAt: shopData.updatedAt?.toDate() || new Date(),
          } as Shop;
          
          setMyShop(shop);
          setShops([shop]);
          setProductFormData(prev => ({ ...prev, shopId: shop.id }));
        } else {
          setError('No se encontró tu tienda. Por favor, recarga la página.');
          return;
        }
      } catch (err: any) {
        console.error('Error obteniendo tienda:', err);
        setError('No se pudo obtener la información de tu tienda. Por favor, recarga la página e intenta nuevamente.');
        return;
      }
    }

    // Validar que se tenga una tienda asignada
    if (!productFormData.shopId) {
      if (user?.role === 'shop') {
        setError('No se pudo asociar tu tienda. Por favor, recarga la página e intenta nuevamente.');
      } else {
        setError('Por favor selecciona una tienda para crear el producto.');
      }
      return;
    }

    const errors = validateDimensions(productFormData.height, productFormData.width, productFormData.depth);
    if (errors.length > 0) {
      setDimensionErrors(errors);
      setError('Por favor corrige los errores en las dimensiones');
      return;
    }

    if (!productFormData.name || !productFormData.description || productFormData.value <= 0) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setCreatingProduct(true);
    try {
      const newProduct = await productService.createProduct(productFormData);
      setProducts([...products, newProduct]);
      handleCloseProductModal();
      setError(null);
      setProductImageFile(null);
    } catch (err: any) {
      setError(err.message || 'Error al crear el producto');
    } finally {
      setCreatingProduct(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      pending: '#FFA500',
      verified: '#4CAF50',
      blocked: '#F44336',
      active: '#2196F3',
      paused: '#FF9800',
      inactive: '#9E9E9E',
      archived: '#757575',
      draft: '#FF9800',
      pending_approval: '#FFC107',
      sold_out: '#9C27B0',
      finished: '#4CAF50',
      cancelled: '#F44336',
      rejected: '#F44336',
      sold: '#2196F3',
      winner: '#FFD700',
      refunded: '#9E9E9E',
      held: '#FF9800',
      released: '#4CAF50',
      executed: '#F44336',
    };
    return statusColors[status] || '#757575';
  };

  if (!isHydrated || loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.errorContainer}>
          <p>No autenticado</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <Logo size="small" showText={false} />
            <h1>Dashboard</h1>
          </div>
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <FiUser />
              </div>
              <div className={styles.userDetails}>
                <p className={styles.userName}>{user.name}</p>
                <p className={styles.email}>{user.email}</p>
                <span className={styles.role}>{user.role}</span>
              </div>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <FiLogOut className={styles.logoutIcon} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* Tabs - Different for user role */}
      <div className={styles.tabsContainer}>
        {user.role === 'user' ? (
          <>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Resumen
        </button>
            <button
              className={`${styles.tab} ${activeTab === 'raffles' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('raffles')}
            >
              Sorteos Disponibles ({activeRaffles.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'tickets' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              Mis Tickets ({myTickets.length})
            </button>
          </>
        ) : user.role === 'admin' ? (
          <>
            <button
              className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <FiClock className={styles.tabIcon} />
              Sorteos Pendientes ({pendingRaffles.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FiBarChart2 className={styles.tabIcon} />
              Resumen
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'raffles' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('raffles')}
            >
              <FiPlay className={styles.tabIcon} />
              Todos los Sorteos ({raffles.length})
            </button>
          </>
        ) : (
          <>
            <button
              className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Resumen
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'products' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Productos ({products.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'raffles' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('raffles')}
        >
          Sorteos ({raffles.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'tickets' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          Tickets ({tickets.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'deposits' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('deposits')}
        >
          Depósitos ({deposits.length})
        </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Pending Raffles Tab - Solo para admin */}
        {activeTab === 'pending' && user.role === 'admin' && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2>Sorteos Pendientes de Aprobación</h2>
            </div>
            {pendingRaffles.length === 0 ? (
              <p className={styles.emptyMessage}>No hay sorteos pendientes de aprobación</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tienda</th>
                    <th>Producto</th>
                    <th>Valor</th>
                    <th>Total Tickets</th>
                    <th>Requiere Depósito</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRaffles.map((raffle) => (
                    <tr key={raffle.id}>
                      <td>
                        {(raffle as any).shop?.name || 'N/A'}
                      </td>
                      <td>
                        <strong>{raffle.product?.name || 'Producto desconocido'}</strong>
                      </td>
                      <td>
                        S/. {(raffle.productValue || raffle.product?.value || 0).toLocaleString('es-PE', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </td>
                      <td>{raffle.totalTickets.toLocaleString()}</td>
                      <td>
                        {(raffle as any).requiresDeposit ? (
                          <span className={styles.badge} style={{ backgroundColor: '#FF9800' }}>
                            Sí
                          </span>
                        ) : (
                          <span className={styles.badge} style={{ backgroundColor: '#4CAF50' }}>
                            No
                          </span>
                        )}
                      </td>
                      <td>
                        {new Date(raffle.createdAt).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className={styles.createBtn}
                            onClick={() => handleViewRaffleDetail(raffle.id)}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Ver Detalles
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Products Tab - Solo para shop */}
        {activeTab === 'products' && user.role === 'shop' && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2>Productos</h2>
              <button 
                className={styles.createBtn}
                onClick={handleOpenProductModal}
              >
                Crear Producto
              </button>
            </div>
            {products.length === 0 ? (
              <p className={styles.emptyMessage}>No hay productos creados</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Valor</th>
                    <th>Dimensiones</th>
                    <th>Requiere Depósito</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td><strong>{product.name}</strong></td>
                      <td>S/. {product.value.toLocaleString()}</td>
                      <td>{product.height}×{product.width}×{product.depth} cm</td>
                      <td>
                        {product.requiresDeposit ? (
                          <span className={styles.badge} style={{ backgroundColor: '#FF9800' }}>
                            Sí
                          </span>
                        ) : (
                          <span className={styles.badge} style={{ backgroundColor: '#4CAF50' }}>
                            No
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={styles.badge}
                          style={{ backgroundColor: getStatusColor(product.status) }}
                        >
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            {user.role === 'user' ? (
              <>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <FiPlay />
                  </div>
                  <h3>Sorteos Disponibles</h3>
                  <p className={styles.bigNumber}>{activeRaffles.length}</p>
                  <p className={styles.subtitle}>Sorteos activos para participar</p>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <FiTag />
                  </div>
                  <h3>Mis Tickets</h3>
                  <p className={styles.bigNumber}>{myTickets.length}</p>
                  <p className={styles.subtitle}>Tickets comprados</p>
                  <div className={styles.statusBreakdown}>
                    {myTickets.length > 0 && (
                      <>
                        <span>Vendidos: {myTickets.filter(t => t.status === 'sold').length}</span>
                        <span>Ganadores: {myTickets.filter(t => t.status === 'winner').length}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <FiAward />
                  </div>
                  <h3>Sorteos Participados</h3>
                  <p className={styles.bigNumber}>
                    {new Set(myTickets.map(t => t.raffleId)).size}
                  </p>
                  <p className={styles.subtitle}>Diferentes sorteos</p>
                </div>
              </>
            ) : user.role === 'admin' ? (
              <>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <FiClock />
                  </div>
                  <h3>Sorteos Pendientes</h3>
                  <p className={styles.bigNumber}>{pendingRaffles.length}</p>
                  <p className={styles.subtitle}>Esperando aprobación</p>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <FiPlay />
                  </div>
                  <h3>Sorteos Activos</h3>
                  <p className={styles.bigNumber}>{raffles.filter(r => r.status === 'active').length}</p>
                  <p className={styles.subtitle}>Sorteos en curso</p>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <FiCheckCircle />
                  </div>
                  <h3>Sorteos Finalizados</h3>
                  <p className={styles.bigNumber}>{raffles.filter(r => r.status === 'finished').length}</p>
                  <p className={styles.subtitle}>Sorteos completados</p>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <FiShoppingBag />
                  </div>
                  <h3>Total Sorteos</h3>
                  <p className={styles.bigNumber}>{raffles.length}</p>
                  <p className={styles.subtitle}>Todos los sorteos</p>
                  <div className={styles.statusBreakdown}>
                    <span>Pendientes: {pendingRaffles.length}</span>
                    <span>Activos: {raffles.filter(r => r.status === 'active').length}</span>
                    <span>Finalizados: {raffles.filter(r => r.status === 'finished').length}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <FiPackage />
                  </div>
                  <h3>Productos</h3>
                  <p className={styles.bigNumber}>{products.length}</p>
                  <p className={styles.subtitle}>Total de productos</p>
                  <div className={styles.statusBreakdown}>
                    {products.length > 0 && (
                      <>
                        <span>Activos: {products.filter(p => p.status === 'active').length}</span>
                        <span>Inactivos: {products.filter(p => p.status === 'inactive').length}</span>
                        <span>Con depósito: {products.filter(p => p.requiresDeposit).length}</span>
                      </>
                    )}
                  </div>
                </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <FiPlay />
              </div>
              <h3>Sorteos</h3>
              <p className={styles.bigNumber}>{raffles.length}</p>
              <p className={styles.subtitle}>Total de sorteos</p>
              <div className={styles.statusBreakdown}>
                {raffles.length > 0 && (
                  <>
                    <span>Activos: {raffles.filter(r => r.status === 'active').length}</span>
                    <span>Pausados: {raffles.filter(r => r.status === 'paused').length}</span>
                    <span>Finalizados: {raffles.filter(r => r.status === 'finished').length}</span>
                    <span>Tickets vendidos: {raffles.reduce((sum, r) => sum + r.soldTickets, 0).toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <FiTag />
              </div>
              <h3>Tickets</h3>
              <p className={styles.bigNumber}>{tickets.length}</p>
              <p className={styles.subtitle}>Total de tickets</p>
              <div className={styles.statusBreakdown}>
                {tickets.length > 0 && (
                  <>
                    <span>Vendidos: {tickets.filter(t => t.status === 'sold').length}</span>
                    <span>Ganadores: {tickets.filter(t => t.status === 'winner').length}</span>
                    <span>Reembolsados: {tickets.filter(t => t.status === 'refunded').length}</span>
                  </>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <FiDollarSign />
              </div>
              <h3>Depósitos</h3>
              <p className={styles.bigNumber}>{deposits.length}</p>
              <p className={styles.subtitle}>Total de depósitos</p>
              <div className={styles.statusBreakdown}>
                {deposits.length > 0 && (
                  <>
                    <span>Retenidos: {deposits.filter(d => d.status === 'held').length}</span>
                    <span>Liberados: {deposits.filter(d => d.status === 'released').length}</span>
                    <span>Monto total: ${deposits.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
              </>
            )}
          </div>
        )}

        {/* Raffles Tab */}
        {activeTab === 'raffles' && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2>{user.role === 'user' ? 'Sorteos Disponibles' : 'Sorteos'}</h2>
              {user.role !== 'user' && (
              <button 
                className={styles.createBtn}
                onClick={handleOpenModal}
              >
                Crear Sorteo
              </button>
              )}
            </div>
            {user.role === 'user' ? (
              // Vista para usuarios: mostrar todos los sorteos creados
              activeRaffles.length === 0 ? (
                <p className={styles.emptyMessage}>No hay sorteos disponibles en este momento</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  {activeRaffles.map((raffle) => {
                    const availableTickets = raffle.totalTickets - raffle.soldTickets;
                    const progress = raffle.totalTickets > 0 ? (raffle.soldTickets / raffle.totalTickets) * 100 : 0;
                    const productName = raffle.product?.name || products.find(p => p.id === raffle.productId)?.name || 'Producto desconocido';
                    const productValue = raffle.productValue || raffle.product?.value || products.find(p => p.id === raffle.productId)?.value || 0;
                    const quantity = ticketQuantity[raffle.id] || 1;
                    const totalPrice = quantity * productValue;
                    const canBuy = raffle.status === 'active' && availableTickets > 0;
                    const statusLabels: { [key: string]: string } = {
                      'active': 'Activo',
                      'paused': 'Pausado',
                      'sold_out': 'Agotado',
                      'finished': 'Finalizado',
                      'cancelled': 'Cancelado',
                      'pending_approval': 'Pendiente de Aprobación'
                    };
                    
                    return (
                      <div key={raffle.id} style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '20px',
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        opacity: raffle.status === 'cancelled' || raffle.status === 'finished' ? 0.8 : 1
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                          <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#333', flex: 1 }}>{productName}</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                            <span
                              className={styles.badge}
                              style={{ 
                                backgroundColor: getStatusColor(raffle.status),
                                fontSize: '12px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                color: '#fff',
                                fontWeight: 'bold'
                              }}
                            >
                              {statusLabels[raffle.status] || raffle.status}
                            </span>
                            {raffle.status === 'finished' && raffle.winnerTicketId && (
                              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                {myTickets.some(t => t.raffleId === raffle.id && t.id === raffle.winnerTicketId) ? (
                                  <span style={{ 
                                    padding: '2px 6px',
                                    backgroundColor: '#4CAF50',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    fontWeight: 'bold'
                                  }}>
                                    🏆 Ganaste!
                                  </span>
                                ) : (
                                  <span style={{ color: '#999' }}>
                                    Finalizado
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2', margin: '10px 0' }}>
                          S/. {productValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        
                        <div style={{ margin: '15px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                            <span>Tickets disponibles:</span>
                            <strong style={{ color: availableTickets > 0 ? '#4CAF50' : '#F44336' }}>
                              {availableTickets.toLocaleString()} / {raffle.totalTickets.toLocaleString()}
                            </strong>
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: '8px', 
                            backgroundColor: '#e0e0e0', 
                            borderRadius: '4px',
                            overflow: 'hidden',
                            marginTop: '5px'
                          }}>
                            <div style={{
                              width: `${progress}%`,
                              height: '100%',
                              backgroundColor: progress >= 100 ? '#4CAF50' : '#2196F3',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            {Math.round(progress)}% vendido
                          </p>
                        </div>

                        {canBuy && (
                          <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                              Cantidad de tickets:
                            </label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <button
                                onClick={() => setTicketQuantity({
                                  ...ticketQuantity,
                                  [raffle.id]: Math.max(1, quantity - 1)
                                })}
                                disabled={quantity <= 1}
                                className={styles.quantityBtn}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={availableTickets}
                                value={quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1;
                                  setTicketQuantity({
                                    ...ticketQuantity,
                                    [raffle.id]: Math.max(1, Math.min(val, availableTickets))
                                  });
                                }}
                                style={{
                                  width: '70px',
                                  padding: '8px',
                                  border: '2px solid #e0e0e0',
                                  borderRadius: '6px',
                                  textAlign: 'center',
                                  fontSize: '14px',
                                  fontWeight: '600'
                                }}
                              />
                              <button
                                onClick={() => setTicketQuantity({
                                  ...ticketQuantity,
                                  [raffle.id]: Math.min(availableTickets, quantity + 1)
                                })}
                                disabled={quantity >= availableTickets}
                                className={styles.quantityBtn}
                              >
                                +
                              </button>
                            </div>
                            <p style={{ fontSize: '14px', marginTop: '10px', fontWeight: 'bold' }}>
                              Total: S/. {totalPrice.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <button
                              onClick={() => handleBuyTickets(raffle.id)}
                              disabled={buyingTickets === raffle.id || availableTickets === 0}
                              className={styles.buyTicketsBtn}
                            >
                              {buyingTickets === raffle.id ? 'Procesando...' : 'Comprar Tickets'}
                            </button>
                          </div>
                        )}
                        {!canBuy && (
                          <div style={{ 
                            marginTop: '20px', 
                            padding: '12px', 
                            backgroundColor: '#f5f5f5', 
                            borderRadius: '4px',
                            textAlign: 'center',
                            color: '#666',
                            fontSize: '14px'
                          }}>
                            {raffle.status === 'sold_out' && 'Este sorteo está agotado'}
                            {raffle.status === 'finished' && 'Este sorteo ha finalizado'}
                            {raffle.status === 'cancelled' && 'Este sorteo ha sido cancelado'}
                            {raffle.status === 'paused' && 'Este sorteo está pausado'}
                            {raffle.status === 'pending_approval' && 'Este sorteo está pendiente de aprobación'}
                            {raffle.status !== 'active' && raffle.status !== 'sold_out' && raffle.status !== 'finished' && raffle.status !== 'cancelled' && raffle.status !== 'pending_approval' && raffle.status !== 'paused' && 'No disponible para compra'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              // Vista para shop/admin: tabla de sorteos
              raffles.length === 0 ? (
              <p className={styles.emptyMessage}>No hay sorteos creados</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Valor</th>
                    <th>Total Tickets</th>
                    <th>Vendidos</th>
                    <th>Disponibles</th>
                    <th>Progreso</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                    <th>Fecha Creación</th>
                  </tr>
                </thead>
                <tbody>
                  {raffles.map((raffle) => {
                    const progress = raffle.totalTickets > 0 ? (raffle.soldTickets / raffle.totalTickets) * 100 : 0;
                    const availableTickets = raffle.totalTickets - raffle.soldTickets;
                    const productName = raffle.product?.name || products.find(p => p.id === raffle.productId)?.name || 'Producto desconocido';
                    const productValue = raffle.productValue || raffle.product?.value || products.find(p => p.id === raffle.productId)?.value || 0;
                    const statusLabels: { [key: string]: string } = {
                      'draft': 'Borrador',
                      'pending_approval': 'Pendiente de Aprobación',
                      'active': 'Activo',
                      'paused': 'Pausado',
                      'sold_out': 'Agotado',
                      'finished': 'Finalizado',
                      'cancelled': 'Cancelado',
                      'rejected': 'Rechazado'
                    };
                    
                    return (
                      <tr key={raffle.id}>
                        <td><strong>{productName}</strong></td>
                        <td>S/. {productValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>{raffle.totalTickets.toLocaleString()}</td>
                        <td>{raffle.soldTickets.toLocaleString()}</td>
                        <td>
                          <span style={{ 
                            color: availableTickets > 0 ? '#4CAF50' : '#F44336',
                            fontWeight: 'bold'
                          }}>
                            {availableTickets.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${progress}%` }}
                            />
                            <span className={styles.progressText}>{Math.round(progress)}%</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={styles.badge}
                            style={{ backgroundColor: getStatusColor(raffle.status) }}
                          >
                            {statusLabels[raffle.status] || raffle.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {raffle.status === 'draft' && user.role === 'shop' && (
                              <button
                                className={styles.createBtn}
                                onClick={() => handleSubmitForApproval(raffle.id)}
                                disabled={submittingRaffle === raffle.id}
                                style={{ 
                                  padding: '6px 12px', 
                                  fontSize: '12px',
                                  background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                                  whiteSpace: 'nowrap'
                                }}
                                title="Enviar este sorteo a aprobación para que los usuarios puedan comprar tickets"
                              >
                                {submittingRaffle === raffle.id ? (
                                  'Enviando...'
                                ) : (
                                  <>
                                    <FiCheckCircle style={{ marginRight: '4px' }} />
                                    Enviar a Aprobación
                                  </>
                                )}
                              </button>
                            )}
                            {raffle.status === 'active' && user.role === 'shop' && (
                              <button
                                className={styles.cancelBtn}
                                onClick={() => handlePauseRaffle(raffle.id)}
                                disabled={pausingRaffle === raffle.id}
                                style={{ 
                                  padding: '6px 12px', 
                                  fontSize: '12px',
                                  backgroundColor: '#FF9800',
                                  color: 'white',
                                  borderColor: '#FF9800',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {pausingRaffle === raffle.id ? (
                                  'Pausando...'
                                ) : (
                                  <>
                                    <FiPause style={{ marginRight: '4px' }} />
                                    Pausar
                                  </>
                                )}
                              </button>
                            )}
                            {raffle.status === 'paused' && user.role === 'shop' && (
                              <button
                                className={styles.submitBtn}
                                onClick={() => handleResumeRaffle(raffle.id)}
                                disabled={resumingRaffle === raffle.id}
                                style={{ 
                                  padding: '6px 12px', 
                                  fontSize: '12px',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {resumingRaffle === raffle.id ? (
                                  'Reanudando...'
                                ) : (
                                  <>
                                    <FiPlayCircle style={{ marginRight: '4px' }} />
                                    Reanudar
                                  </>
                                )}
                              </button>
                            )}
                            {raffle.status === 'pending_approval' && user.role === 'shop' && (
                              <span style={{ 
                                fontSize: '12px', 
                                color: '#FF9800',
                                fontStyle: 'italic',
                                whiteSpace: 'nowrap'
                              }}>
                                ⏳ Esperando aprobación
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {new Date(raffle.createdAt).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              )
            )}
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className={styles.tableContainer}>
            <h2>{user.role === 'user' ? 'Mis Tickets' : 'Tickets'}</h2>
            {user.role === 'user' ? (
              // Vista para usuarios: mostrar sus tickets con información del sorteo
              myTickets.length === 0 ? (
                <p className={styles.emptyMessage}>No has comprado tickets aún. ¡Participa en los sorteos disponibles!</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Número de Ticket</th>
                      <th>Producto del Sorteo</th>
                      <th>Valor del Producto</th>
                      <th>Estado</th>
                      <th>Fecha de Compra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTickets.map((ticket) => {
                      const raffle = raffles.find(r => r.id === ticket.raffleId);
                      const productName = raffle?.product?.name || products.find(p => p.id === raffle?.productId)?.name || 'Producto desconocido';
                      const productValue = raffle?.productValue || raffle?.product?.value || products.find(p => p.id === raffle?.productId)?.value || 0;
                      const isWinner = raffle?.status === 'finished' && raffle?.winnerTicketId === ticket.id;
                      const isFinished = raffle?.status === 'finished';
                      
                      return (
                        <tr key={ticket.id} style={{ backgroundColor: isWinner ? '#e8f5e9' : 'transparent' }}>
                          <td>
                            <strong>#{ticket.number}</strong>
                            {isWinner && (
                              <span style={{ 
                                marginLeft: '8px',
                                padding: '2px 8px',
                                backgroundColor: '#4CAF50',
                                color: '#fff',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold'
                              }}>
                                🏆 GANADOR
                              </span>
                            )}
                          </td>
                          <td>{productName}</td>
                          <td>S/. {productValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>
                            {isWinner ? (
                              <span
                                className={styles.badge}
                                style={{ backgroundColor: '#4CAF50', color: '#fff', fontWeight: 'bold' }}
                              >
                                🏆 Ganador
                              </span>
                            ) : isFinished ? (
                              <span
                                className={styles.badge}
                                style={{ backgroundColor: '#9E9E9E', color: '#fff' }}
                              >
                                Finalizado
                              </span>
                            ) : (
                              <span
                                className={styles.badge}
                                style={{ backgroundColor: getStatusColor(ticket.status) }}
                              >
                                {ticket.status === 'sold' ? 'Comprado' : ticket.status === 'winner' ? 'Ganador' : ticket.status}
                              </span>
                            )}
                          </td>
                          <td>
                            {ticket.purchasedAt 
                              ? new Date(ticket.purchasedAt).toLocaleDateString('es-PE', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : '-'
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            ) : (
              // Vista para shop/admin: tabla de todos los tickets
              tickets.length === 0 ? (
              <p className={styles.emptyMessage}>No hay tickets creados</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Sorteo ID</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.slice(0, 50).map((ticket) => (
                    <tr key={ticket.id}>
                      <td><strong>#{ticket.number}</strong></td>
                      <td>{ticket.raffleId.substring(0, 8)}...</td>
                      <td>
                        <span
                          className={styles.badge}
                          style={{ backgroundColor: getStatusColor(ticket.status) }}
                        >
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )
            )}
            {user.role !== 'user' && tickets.length > 50 && (
              <p className={styles.moreItems}>... y {tickets.length - 50} más</p>
            )}
          </div>
        )}

        {/* Deposits Tab - Solo para shop/admin */}
        {activeTab === 'deposits' && user.role !== 'user' && (
          <div className={styles.tableContainer}>
            <h2>Depósitos</h2>
            {deposits.length === 0 ? (
              <p className={styles.emptyMessage}>No hay depósitos creados</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Monto</th>
                    <th>Sorteo ID</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <tr key={deposit.id}>
                      <td><strong>${deposit.amount.toLocaleString()}</strong></td>
                      <td>{deposit.raffleId.substring(0, 8)}...</td>
                      <td>
                        <span
                          className={styles.badge}
                          style={{ backgroundColor: getStatusColor(deposit.status) }}
                        >
                          {deposit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Create Raffle Modal */}
        {showCreateModal && (
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Crear Nuevo Sorteo</h2>
                <button 
                  className={styles.closeBtn}
                  onClick={handleCloseModal}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateRaffle} className={styles.form}>
                {myShop ? (
                  <div className={styles.formGroup}>
                    <label>Tienda</label>
                    <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', color: '#666' }}>
                      <strong>{myShop.name}</strong>
                    </div>
                  </div>
                ) : (
                <div className={styles.formGroup}>
                  <label htmlFor="shopId">Tienda *</label>
                  <select
                    id="shopId"
                    value={formData.shopId}
                    onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                    required
                    className={styles.input}
                  >
                    <option value="">Selecciona una tienda</option>
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="productId">Producto *</label>
                  <select
                    id="productId"
                    value={formData.productId}
                    onChange={(e) => {
                      setFormData({ ...formData, productId: e.target.value });
                    }}
                    required
                    className={styles.input}
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - S/. {product.value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.productId && (() => {
                  const selectedProduct = products.find(p => p.id === formData.productId);
                  const autoCalculatedTickets = selectedProduct ? Math.floor(selectedProduct.value * 2) : 0;
                  
                  return (
                    <div className={styles.formGroup}>
                      <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#e3f2fd', 
                        borderRadius: '8px', 
                        fontSize: '14px',
                        color: '#1976d2',
                        border: '1px solid #90caf9'
                      }}>
                        <div style={{ marginBottom: '8px', fontWeight: '600' }}>
                          📊 Información del Sorteo
                        </div>
                        {selectedProduct && (
                          <>
                            <div style={{ marginBottom: '4px' }}>
                              <strong>Producto:</strong> {selectedProduct.name}
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                              <strong>Valor del producto:</strong> S/. {selectedProduct.value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div style={{ 
                              marginTop: '8px', 
                              padding: '8px', 
                              backgroundColor: '#fff', 
                              borderRadius: '4px',
                              border: '1px solid #90caf9'
                            }}>
                              <strong>🎫 Tickets automáticos:</strong> {autoCalculatedTickets.toLocaleString()} tickets
                              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                (Valor × 2 = {selectedProduct.value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × 2)
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className={styles.formGroup}>
                  <label htmlFor="specialConditions">Condiciones Especiales</label>
                  <textarea
                    id="specialConditions"
                    value={formData.specialConditions}
                    onChange={(e) => setFormData({ ...formData, specialConditions: e.target.value })}
                    placeholder="Ingresa condiciones especiales del sorteo (opcional)"
                    className={styles.textarea}
                    rows={4}
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className={styles.cancelBtn}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingRaffle}
                    className={styles.submitBtn}
                  >
                    {creatingRaffle ? 'Creando...' : 'Crear Sorteo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Product Modal */}
        {showCreateProductModal && (
          <div className={styles.modalOverlay} onClick={handleCloseProductModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Crear Nuevo Producto</h2>
                <button 
                  className={styles.closeBtn}
                  onClick={handleCloseProductModal}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className={styles.form}>
                {myShop && (
                  <div className={styles.formGroup}>
                    <label>Tienda</label>
                    <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', color: '#666' }}>
                      <strong>{myShop.name}</strong>
                    </div>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="productName">Nombre del Producto *</label>
                  <input
                    type="text"
                    id="productName"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    required
                    className={styles.input}
                    placeholder="Ej: iPhone 15 Pro Max"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="productDescription">Descripción *</label>
                  <textarea
                    id="productDescription"
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    required
                    className={styles.textarea}
                    rows={4}
                    placeholder="Describe el producto en detalle..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="productValue">Valor del Producto (S/.) *</label>
                  <input
                    type="number"
                    id="productValue"
                    step="0.01"
                    min="0.01"
                    value={productFormData.value || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, value: parseFloat(e.target.value) || 0 })}
                    required
                    className={styles.input}
                    placeholder="0.00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="productCategory">Categoría (opcional)</label>
                  <input
                    type="text"
                    id="productCategory"
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    className={styles.input}
                    placeholder="Ej: Electrónica, Ropa, Hogar..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="productMainImage">Imagen Principal (opcional)</label>
                  <div style={{ marginBottom: '10px' }}>
                    <input
                      type="file"
                      id="productImageFile"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleImageChange}
                      className={styles.input}
                      style={{ marginBottom: '10px' }}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && (
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        Subiendo imagen...
                      </p>
                    )}
                    {productFormData.mainImage && !uploadingImage && (
                      <div style={{ marginTop: '10px' }}>
                        <img
                          src={productFormData.mainImage}
                          alt="Preview"
                          style={{
                            maxWidth: '200px',
                            maxHeight: '200px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '12px' }}>
                    O ingresa una URL de imagen:
                  </small>
                  <input
                    type="url"
                    id="productMainImage"
                    value={productFormData.mainImage}
                    onChange={(e) => setProductFormData({ ...productFormData, mainImage: e.target.value })}
                    className={styles.input}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    style={{ marginTop: '5px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Dimensiones (en centímetros) *</h3>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                    Máximo permitido: 15cm por cada dimensión. Si alguna dimensión excede este límite, se requerirá un depósito de garantía.
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                    <div className={styles.formGroup}>
                      <label htmlFor="productHeight">Altura (cm)</label>
                      <input
                        type="number"
                        id="productHeight"
                        step="0.1"
                        min="0.1"
                        max="15"
                        value={productFormData.height || ''}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                        required
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="productWidth">Ancho (cm)</label>
                      <input
                        type="number"
                        id="productWidth"
                        step="0.1"
                        min="0.1"
                        max="15"
                        value={productFormData.width || ''}
                        onChange={(e) => handleDimensionChange('width', e.target.value)}
                        required
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="productDepth">Profundidad (cm)</label>
                      <input
                        type="number"
                        id="productDepth"
                        step="0.1"
                        min="0.1"
                        max="15"
                        value={productFormData.depth || ''}
                        onChange={(e) => handleDimensionChange('depth', e.target.value)}
                        required
                        className={styles.input}
                      />
                    </div>
                  </div>

                  {dimensionErrors.length > 0 && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
                      <strong>Errores en las dimensiones:</strong>
                      <ul style={{ margin: '10px 0 0 20px' }}>
                        {dimensionErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(productFormData.height > 15 || productFormData.width > 15 || productFormData.depth > 15) && dimensionErrors.length === 0 && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
                      ⚠️ Este producto requiere un depósito de garantía porque excede las dimensiones máximas permitidas (15×15×15 cm).
                      <br />
                      <strong>Depósito requerido:</strong> S/. {productFormData.value.toFixed(2)}
                    </div>
                  )}

                  {productFormData.height > 0 && productFormData.width > 0 && productFormData.depth > 0 && 
                   productFormData.height <= 15 && productFormData.width <= 15 && productFormData.depth <= 15 && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px', color: '#155724' }}>
                      ✓ Este producto no requiere depósito de garantía.
                    </div>
                  )}
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={handleCloseProductModal}
                    className={styles.cancelBtn}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingProduct}
                    className={styles.submitBtn}
                  >
                    {creatingProduct ? 'Creando...' : 'Crear Producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Raffle Detail Modal - Para admin */}
        {showRaffleDetail && selectedRaffle && user.role === 'admin' && (
          <div className={styles.modalOverlay} onClick={() => { setShowRaffleDetail(false); setSelectedRaffle(null); }}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Detalles del Sorteo</h2>
                <button 
                  className={styles.closeBtn}
                  onClick={() => { setShowRaffleDetail(false); setSelectedRaffle(null); }}
                >
                  ×
                </button>
              </div>

              <div className={styles.form} style={{ padding: '24px' }}>
                <div className={styles.formGroup}>
                  <label>Tienda</label>
                  <p style={{ margin: '8px 0', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                    {(selectedRaffle as any).shop?.name || 'N/A'}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label>Producto</label>
                  <p style={{ margin: '8px 0', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                    {selectedRaffle.product?.name || 'Producto desconocido'}
                  </p>
                </div>

                {(selectedRaffle as any).product?.description && (
                  <div className={styles.formGroup}>
                    <label>Descripción</label>
                    <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                      {(selectedRaffle as any).product.description}
                    </p>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label>Valor del Producto</label>
                  <p style={{ margin: '8px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
                    S/. {(selectedRaffle.productValue || selectedRaffle.product?.value || 0).toLocaleString('es-PE', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label>Total de Tickets</label>
                  <p style={{ margin: '8px 0', color: '#333', fontSize: '16px' }}>
                    {selectedRaffle.totalTickets.toLocaleString()}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label>Requiere Depósito</label>
                  <p style={{ margin: '8px 0' }}>
                    {(selectedRaffle as any).requiresDeposit ? (
                      <span className={styles.badge} style={{ backgroundColor: '#FF9800' }}>
                        Sí
                      </span>
                    ) : (
                      <span className={styles.badge} style={{ backgroundColor: '#4CAF50' }}>
                        No
                      </span>
                    )}
                  </p>
                </div>

                {(selectedRaffle as any).specialConditions && (
                  <div className={styles.formGroup}>
                    <label>Condiciones Especiales</label>
                    <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                      {(selectedRaffle as any).specialConditions}
                    </p>
                  </div>
                )}

                <div className={styles.formActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => { setShowRaffleDetail(false); setSelectedRaffle(null); }}
                    disabled={approvingRaffle === selectedRaffle.id || rejectingRaffle === selectedRaffle.id}
                  >
                    Cerrar
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setShowRejectModal(true)}
                    disabled={approvingRaffle === selectedRaffle.id || rejectingRaffle === selectedRaffle.id}
                    style={{ backgroundColor: '#F44336', color: 'white', borderColor: '#F44336' }}
                  >
                    <FiXCircle style={{ marginRight: '6px' }} />
                    Rechazar
                  </button>
                  <button
                    className={styles.submitBtn}
                    onClick={() => handleApproveRaffle(selectedRaffle.id)}
                    disabled={approvingRaffle === selectedRaffle.id || rejectingRaffle === selectedRaffle.id}
                  >
                    {approvingRaffle === selectedRaffle.id ? (
                      'Procesando...'
                    ) : (
                      <>
                        <FiCheckCircle style={{ marginRight: '6px' }} />
                        Aprobar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal - Para admin */}
        {showRejectModal && selectedRaffle && user.role === 'admin' && (
          <div className={styles.modalOverlay} onClick={() => { setShowRejectModal(false); setRejectReason(''); }}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Rechazar Sorteo</h2>
                <button 
                  className={styles.closeBtn}
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                >
                  ×
                </button>
              </div>

              <div className={styles.form} style={{ padding: '24px' }}>
                <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                  Por favor, proporciona un motivo para rechazar este sorteo. La tienda podrá ver este motivo.
                </p>
                <div className={styles.formGroup}>
                  <label>Motivo del Rechazo *</label>
                  <textarea
                    className={styles.textarea}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Ingresa el motivo del rechazo..."
                    disabled={rejectingRaffle === selectedRaffle.id}
                    rows={4}
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                    disabled={rejectingRaffle === selectedRaffle.id}
                  >
                    Cancelar
                  </button>
                  <button
                    className={styles.submitBtn}
                    onClick={() => handleRejectRaffle(selectedRaffle.id)}
                    disabled={rejectingRaffle === selectedRaffle.id || !rejectReason.trim()}
                    style={{ backgroundColor: '#F44336', borderColor: '#F44336' }}
                  >
                    {rejectingRaffle === selectedRaffle.id ? (
                      'Procesando...'
                    ) : (
                      <>
                        <FiXCircle style={{ marginRight: '6px' }} />
                        Confirmar Rechazo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}