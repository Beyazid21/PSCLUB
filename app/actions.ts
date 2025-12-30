'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { pusherServer } from '@/lib/pusher';

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  purchasePrice: z.coerce.number().min(0),
  categoryId: z.string().min(1),
  image: z.string().optional(),
  inStock: z.boolean().default(true),
});
export async function updateStatistic(orderId: string) {
  try {
    // 1. Sifarişi və onun içindəki məhsulların qiymətlərini götürürük
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) return;


    let totalRevenue = 0;
    let totalProfit = 0;

    order.orderItems.forEach((item) => {
      const salePrice = item.product.price * item.quantity;
      const purchaseCost = item.product.purchasePrice * item.quantity;
      
      totalRevenue += salePrice;
      totalProfit += (salePrice - purchaseCost);
    });

    // 3. Bu günün tarixini tapırıq (Saatları sıfırlayırıq)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 4. Statistic cədvəlinə yazırıq (Varsa yenilə, yoxdursa yarat)
    await prisma.statistic.upsert({
      where: { date: today }, // Schema-da 'date' sahəsinə @unique qoymusunuzsa
      update: {
        totalOrders: { increment: 1 },
        totalRevenue: { increment: totalRevenue },
        totalProfit: { increment: totalProfit },
      },
      create: {
        date: today,
        totalOrders: 1,
        totalRevenue: totalRevenue,
        totalProfit: totalProfit,
      },
    });
  } catch (error) {
    console.error('Statistika yenilənərkən xəta:', error);
  }
}
export async function getProducts() {
  try {
    return await prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}
export async function deleteOrder(id: string) {
  try {
    // Əvvəlcə sifarişin içindəki məhsulları (OrderItem) silmək lazımdır (Database referansı üçün)
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    });

    // Sonra sifarişin özünü silirik
    await prisma.order.delete({
      where: { id }
    });

    revalidatePath('/admin/orders'); // Səhifəni yeniləyirik ki, sifariş siyahıdan itsin
    return { success: true };
  } catch (error) {
    console.error('Sifariş silinərkən xəta:', error);
    return { success: false, error: 'Sifariş silinə bilmədi' };
  }
}
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany();
 
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function createProduct(formData: FormData) {
  const data = {
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    purchasePrice: formData.get('purchasePrice'),
    categoryId: formData.get('categoryId'),
    image: formData.get('image'),
  };

  const parsed = productSchema.parse(data);

  await prisma.product.create({
    data: {
      name: parsed.name,
      description: parsed.description,
      price: parsed.price,
      categoryId: parsed.categoryId,
      purchasePrice: parsed.purchasePrice,
      
      image: parsed.image || '',
      inStock: true,
    },
  });

  revalidatePath('/admin/products');
  revalidatePath('/menu/[tableId]', 'page');
  redirect('/admin/products');
}

export async function updateProduct(id: string, formData: FormData) {
  const data = {
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    categoryId: formData.get('categoryId'),
    purchasePrice: formData.get('purchasePrice'),
    image: formData.get('image'),
  };



  const parsed = productSchema.parse(data);

  await prisma.product.update({
    where: { id },
    data: {
      name: parsed.name,
      purchasePrice: parsed.purchasePrice,
      description: parsed.description,
      price: parsed.price,
      categoryId: parsed.categoryId,
      image: parsed.image || '',
    },
  });

  revalidatePath('/admin/products');
  revalidatePath('/menu/[tableId]', 'page');
  redirect('/admin/products');
}

export async function deleteProduct(id: string) {
  try {
    // Check if product is in any orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id }
    });

    if (orderItemsCount > 0) {
      return { 
        success: false, 
        error: 'Bu məhsul sifarişlərdə istifadə olunub. Əvvəlcə sifarişləri idarə edin və ya məhsulu stokdan çıxarın.' 
      };
    }

    await prisma.product.delete({
      where: { id },
    });
    
    revalidatePath('/admin/products');
    revalidatePath('/menu/[tableId]', 'page');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete product:', error);
    return { success: false, error: 'Məhsul silinə bilmədi' };
  }
}

// Ensure a test table exists
async function ensureTableExists(tableNumber: string) {
  const number = parseInt(tableNumber);
  let table = await prisma.table.findUnique({ where: { number } });
  
  if (!table) {
    table = await prisma.table.create({
      data: {
        number,
        qrCode: `table-${number}`,
        isActive: true
      }
    });
  }
  
  return table;
}
export async function getTables() {
  try {
    const tables = await prisma.table.findMany();
    return tables;
  } catch (error) {
    console.error('Failed to fetch tables:', error);
    return [];
  }
}
export async function getTableById(id: string) {
  try {
    const table = await prisma.table.findUnique({ where: { id } });
    return table;
  } catch (error) {
    console.error('Failed to fetch table:', error);
    return null;
  }
}

export async function updateTable(id: string, data: { isActive: boolean; name: string; number: number }) {
  try {
    const table = await prisma.table.update({
      where: { id },
      data: {
        number: data.number,
        name: data.name,
        isActive: data.isActive,
      },
    });
    revalidatePath('/admin/tables');
    return { success: true, table };
  } catch (error) {
    console.error('Failed to update table:', error);
    return { success: false, error: 'Yenilənmə zamanı xəta baş verdi.' };
  }
}

export async function deleteTable(id: string) {
  try {
    await prisma.table.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Failed to delete table:', error);
    return false;
  }
}
export async function createTable(data: { number: number; isActive: boolean; name: string }) {
  try {
    const table = await prisma.table.create({
      data: {
        number: data.number,
        name: data.name,
        isActive: data.isActive,
        qrCode: `table-${data.number}`, // Default QR kod stringi
      },
    });
    revalidatePath('/admin/tables');
    return { success: true, table };
  } catch (error) {
    console.error('Failed to create table:', error);
    return { success: false, error: 'Bu nömrəli masa artıq mövcud ola bilər.' };
  }
}

// export async function createOrder(data: { tableId: string; items: { productId: string; quantity: number }[] }) {
//   try {
//     // Ensure table exists (tableId is actually table number from URL)
//     const table = await ensureTableExists(data.tableId);
    
//     // 1. Create order in DB
//     const order = await prisma.order.create({
//       data: {
//         tableId: table.id,
//         status: 'PENDING',
//         orderItems: {
//           create: data.items.map(item => ({
//             productId: item.productId,
//             quantity: item.quantity,
//           })),
//         },
//       },
//       include: {
//         table: true,
//         orderItems: {
//           include: {
//             product: true
//           }
//         }
//       }
//     });

//     // 2. Notify admin via Pusher (only if configured)
//     try {
//       if (process.env.PUSHER_APP_ID && process.env.NEXT_PUBLIC_PUSHER_KEY) {
//         await pusherServer.trigger('admin-orders', 'new-order', order);
//       }
//     } catch (pusherError) {
//       console.log('Pusher not configured, skipping real-time notification');
//     }

//     return { success: true, orderId: order.id };
//   } catch (error) {
//     console.error('Failed to create order:', error);
//     return { success: false, error: 'Sifariş tamamlanmadı' };
//   }
// }
export async function getOrderById(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,         // Masa məlumatlarını da gətirir
        orderItems: {        // Sifarişin içindəki məhsulları gətirir
          include: {
            product: true    // Hər bir məhsulun adını və qiymətini gətirir
          }
        }
      }
    });
    return order;
  } catch (error) {
    console.error("Sifariş tapılmadı:", error);
    return null;
  }
}

export async function createNewOrder(tableId: string, items: { productId: string, quantity: number }[], userCoords: { lat: number, lng: number }) {
  try {
    
    const restaurantLocation = await prisma.stateInfo.findFirst();
    
    if (restaurantLocation && userCoords) {
      const distance = calculateDistance(
        userCoords.lat, 
        userCoords.lng, 
        restaurantLocation.latitude, 
        restaurantLocation.longitude
      );

      // Əgər məsafə icazə verilən radiusdan çoxdursa (məs: 100 metr)
      if (distance > restaurantLocation.allowedRadius) {
        return { 
          success: false, 
          error: `Obyektdən çox uzaqdasınız (${Math.round(distance)}m). Sifariş üçün məkanda olmalısınız.` 
        };
      }
    }

    // ID-nin doğruluğunu yoxlamaq üçün (Foreign Key xətası almamalıyıq)
    const order = await prisma.order.create({
      data: {
        tableId: tableId, // Burada ID gəlməlidir (Məs: "cm5..." və ya UUID)
        status: "PENDING",
        orderItems: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        table: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    // Pusher və s.
    try {
       await pusherServer.trigger('admin-orders', 'new-order', order);
    } catch (e) {}

    revalidatePath("/admin/orders");
    return { success: true, order };
  } catch (error: any) {
    console.error("Prisma Error:", error.code, error.meta);
    return { 
      success: false, 
      error: "Masa ID-si düzgün deyil və ya məhsul mövcud deyil." 
    };
  }
}
    function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Yer kürəsinin radiusu (metr)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function getOrders() {
  try {
    return await prisma.order.findMany({
      include: {
        table: true,
        orderItems: {
          include: {
            product: true 
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  }
}
export async function getTotalStatistics() {
  try {
    const stats = await prisma.statistic.aggregate({
      _sum: {
        totalOrders: true,
        totalRevenue: true,
        totalProfit: true,
      },
    });

    return {
      totalOrders: stats._sum.totalOrders || 0,
      totalRevenue: stats._sum.totalRevenue || 0,
      totalProfit: stats._sum.totalProfit || 0,
    };
  } catch (error) {
    console.error('Failed to fetch total statistics:', error);
    return { totalOrders: 0, totalRevenue: 0, totalProfit: 0 };
  }
}
export async function updateOrderStatus(id: string, status: string) {
  try {
    // 1. Köhnə statusu yoxlayırıq
    const currentOrder = await prisma.order.findUnique({ where: { id } });
    
    // Əgər artıq DELIVERED-dirsə və yenidən DELIVERED olunursa, heç nə etmə
    if (currentOrder?.status === "DELIVERED" && status === "DELIVERED") {
        return { success: true };
    }

    // 2. Əgər İLK DƏFƏ DELIVERED olursa, statistikanı yenilə
    if (status === "DELIVERED") {
      await updateStatistic(id);
    }

    await prisma.order.update({
      where: { id },
      data: { status }
    });
    
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error('Status yenilənərkən xəta:', error);
    return { success: false };
  }
}

// Category Management
export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;
  
  if (!name || name.trim().length === 0) {
    return { success: false, error: 'Ad mütləqdir' };
  }

  try {
    await prisma.category.create({
      data: { name: name.trim() }
    });

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Kateqoriya yaradıla bilmədi' };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  
  if (!name || name.trim().length === 0) {
    return { success: false, error: 'Ad mütləqdir' };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { name: name.trim() }
    });

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Kateqoriya yenilənə bilmədi' };
  }
}

export async function deleteCategory(id: string) {
  try {
    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productsCount > 0) {
      return { success: false, error: 'Bu kateqoriyada məhsullar var. Əvvəlcə məhsulları silin.' };
    }

    await prisma.category.delete({
      where: { id }
    });

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Kateqoriya silinə bilmədi' };
  }
}

export async function getCategory(id: string) {
  try {
    return await prisma.category.findUnique({
      where: { id }
    });
  } catch (error) {
    return null;
  }
}

export async function getProduct(id: string) {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
  } catch (error) {
    return null;
  }
}


//StateInfo
export async function getStateInfo() {
  try {
    return await prisma.stateInfo.findFirst();
  } catch (error) {
    console.error("StateInfo tapılmadı:", error);
    return null;
  }
}
export async function toggleProductStock(productId: string, currentStatus: boolean) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { inStock: !currentStatus },
    });
    
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Stok statusu dəyişdirilə bilmədi" };
  }
}

export async function saveStateInfo(formData: FormData) {
  try {
    const data = {
      restaurantName: formData.get('restaurantName') as string,
      latitude: parseFloat(formData.get('latitude') as string),
      longitude: parseFloat(formData.get('longitude') as string),
      allowedRadius: parseInt(formData.get('allowedRadius') as string),
    };

    // Yalnız 1 sətir olacağı üçün sabit bir ID ("main_settings") istifadə edirik
    await prisma.stateInfo.upsert({
      where: { id: "main_settings" },
      update: data,
      create: {
        id: "main_settings",
        ...data,
      },
    });

    revalidatePath('/admin/settings'); // Parametrlər səhifəsini yeniləyirik
    return { success: true };
  } catch (error) {
    console.error("StateInfo yadda saxlanılarkən xəta:", error);
    return { success: false, error: "Məlumatları yadda saxlamaq mümkün olmadı." };
  }
}



