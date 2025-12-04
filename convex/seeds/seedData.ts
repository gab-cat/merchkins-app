import { internalMutation } from '../_generated/server';
import { Id, Doc } from '../_generated/dataModel';
import { v } from 'convex/values';

export const seedData = internalMutation({
  args: {},
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx) => {
    const now = Date.now();

    // 1) Ensure admin user
    const adminEmail = 'admin@merchkins.test';
    let adminUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', adminEmail))
      .first();

    if (!adminUser) {
      const adminUserId = await ctx.db.insert('users', {
        isDeleted: false,
        clerkId: 'seed_admin',
        isOnboarded: true,
        firstName: 'Seed',
        lastName: 'Admin',
        managerId: undefined,
        managerInfo: undefined,
        imageUrl: undefined,
        email: adminEmail,
        phone: '0000000000',
        isStaff: true,
        isAdmin: true,
        isSetupDone: true,
        isMerchant: true,
        cartId: undefined,
        permissions: undefined,
        totalOrders: 0,
        totalSpent: 0,
        reviewCount: 0,
        lastLoginAt: now,
        lastOrderAt: undefined,
        organizationMemberships: undefined,
        profileVisibility: 'public',
        notificationPrefs: {
          emailNotifications: true,
          pushNotifications: true,
          orderUpdates: true,
          promotionalEmails: false,
        },
        createdAt: now,
        updatedAt: now,
      });
      adminUser = await ctx.db.get(adminUserId);
    }

    if (!adminUser) {
      throw new Error('Failed to create or fetch admin user');
    }

    // 2) Ensure organization
    const orgSlug = 'merchkins';
    let organization = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();

    if (!organization) {
      const organizationId = await ctx.db.insert('organizations', {
        isDeleted: false,
        name: 'Merchkins',
        slug: orgSlug,
        description: 'Seeded demo organization',
        logo: undefined,
        bannerImage: undefined,
        themeSettings: {
          primaryColor: '#1d43d8',
          secondaryColor: '#2563eb',
          mode: 'auto',
          fontFamily: 'Inter, ui-sans-serif, system-ui',
          borderRadius: 'medium',
        },
        website: 'https://example.com',
        industry: 'Retail',
        size: '1-10',
        organizationType: 'PUBLIC',
        memberCount: 1,
        adminCount: 1,
        activeProductCount: 0,
        totalOrderCount: 0,
        createdAt: now,
        updatedAt: now,
      });
      organization = await ctx.db.get(organizationId);
    }

    if (!organization) {
      throw new Error('Failed to create or fetch organization');
    }

    // 3) Ensure categories
    const categoriesSeed = [
      {
        name: 'T-Shirts',
        slug: 't-shirts',
        color: '#1e40af',
        isFeatured: true,
        displayOrder: 1,
      },
      {
        name: 'Hoodies',
        slug: 'hoodies',
        color: '#047857',
        isFeatured: true,
        displayOrder: 2,
      },
      {
        name: 'Stickers',
        slug: 'stickers',
        color: '#b45309',
        isFeatured: false,
        displayOrder: 3,
      },
      {
        name: 'Mugs',
        slug: 'mugs',
        color: '#6b21a8',
        isFeatured: false,
        displayOrder: 4,
      },
    ];

    const categoryBySlug: Record<string, Doc<'categories'>> = {};

    for (const cat of categoriesSeed) {
      const inOrg = await ctx.db
        .query('categories')
        .withIndex('by_organization', (q) => q.eq('organizationId', organization!._id))
        .collect();
      let existing = inOrg.find((c) => c.slug === cat.slug && c.isDeleted === false);

      if (!existing) {
        const id = await ctx.db.insert('categories', {
          isDeleted: false,
          organizationId: organization._id,
          organizationInfo: {
            name: organization.name,
            slug: organization.slug,
            logo: organization.logo,
          },
          name: cat.name,
          description: undefined,
          parentCategoryId: undefined,
          parentCategoryName: undefined,
          level: 0,
          slug: cat.slug,
          imageUrl: undefined,
          iconUrl: undefined,
          color: cat.color,
          productCount: 0,
          activeProductCount: 0,
          totalOrderCount: 0,
          totalRevenue: 0,
          isActive: true,
          isFeatured: cat.isFeatured,
          displayOrder: cat.displayOrder,
          seoTitle: undefined,
          seoDescription: undefined,
          tags: [],
          createdAt: now,
          updatedAt: now,
        });
        const createdCategory = await ctx.db.get(id);
        if (createdCategory) existing = createdCategory;
      }

      if (existing) {
        categoryBySlug[existing.slug] = existing;
      }
    }

    // 4) Ensure products
    const placeholderImages = [
      'https://dummyimage.com/800x800/eeeeee/111827.png&text=Merchkins',
      'https://dummyimage.com/800x800/cccccc/111827.png&text=Merchkins',
    ];

    type VariantSeed = {
      variantName: string;
      price: number;
      inventory: number;
    };

    type ProductSeed = {
      slug: string;
      title: string;
      description: string;
      categorySlug: string;
      tags: string[];
      isBestPrice: boolean;
      inventory: number;
      inventoryType: 'STOCK' | 'PREORDER';
      imageUrl: string[];
      variants: Array<VariantSeed>;
      discountLabel?: string;
    };

    const productsSeed: Array<ProductSeed> = [
      {
        slug: 'classic-tee',
        title: 'Classic Tee',
        description: 'Premium cotton t-shirt with a classic fit.',
        categorySlug: 't-shirts',
        tags: ['apparel', 'tshirt'],
        isBestPrice: false,
        inventory: 250,
        inventoryType: 'STOCK' as const,
        imageUrl: placeholderImages,
        variants: [
          { variantName: 'Small', price: 1999, inventory: 50 },
          { variantName: 'Medium', price: 1999, inventory: 100 },
          { variantName: 'Large', price: 1999, inventory: 100 },
        ],
      },
      {
        slug: 'hoodie-cozy',
        title: 'Cozy Hoodie',
        description: 'Warm fleece-lined hoodie for everyday comfort.',
        categorySlug: 'hoodies',
        tags: ['apparel', 'hoodie'],
        isBestPrice: true,
        discountLabel: '20% OFF',
        inventory: 120,
        inventoryType: 'STOCK' as const,
        imageUrl: placeholderImages,
        variants: [
          { variantName: 'Small', price: 3999, inventory: 40 },
          { variantName: 'Medium', price: 3999, inventory: 40 },
          { variantName: 'Large', price: 3999, inventory: 40 },
        ],
      },
      {
        slug: 'logo-sticker-pack',
        title: 'Logo Sticker Pack',
        description: 'High-quality vinyl stickers with the Merchkins logo.',
        categorySlug: 'stickers',
        tags: ['sticker', 'logo'],
        isBestPrice: false,
        inventory: 1000,
        inventoryType: 'STOCK' as const,
        imageUrl: placeholderImages,
        variants: [
          { variantName: '5-pack', price: 599, inventory: 500 },
          { variantName: '10-pack', price: 999, inventory: 500 },
        ],
      },
      {
        slug: 'brand-mug',
        title: 'Brand Mug',
        description: 'Ceramic mug with printed logo. Dishwasher safe.',
        categorySlug: 'mugs',
        tags: ['mug', 'kitchen'],
        isBestPrice: false,
        inventory: 300,
        inventoryType: 'STOCK' as const,
        imageUrl: placeholderImages,
        variants: [
          { variantName: '11oz', price: 1499, inventory: 200 },
          { variantName: '15oz', price: 1799, inventory: 100 },
        ],
      },
    ];

    const productDocs: Array<Doc<'products'>> = [];
    for (const p of productsSeed) {
      const inOrg = await ctx.db
        .query('products')
        .withIndex('by_organization', (q) => q.eq('organizationId', organization!._id))
        .collect();
      const existingInOrg = inOrg.find((prod) => prod.slug === p.slug && prod.isDeleted === false);

      if (existingInOrg) {
        productDocs.push(existingInOrg);
        continue;
      }

      const categoryDoc = categoryBySlug[p.categorySlug];
      const variantPrices = p.variants.map((v) => v.price);
      const minPrice = Math.min(...variantPrices);
      const maxPrice = Math.max(...variantPrices);
      const processedVariants = p.variants.map((variant, index) => ({
        isActive: true,
        variantId: `variant-${p.slug}-${index}-${now}`,
        variantName: variant.variantName,
        price: variant.price,
        inventory: variant.inventory,
        imageUrl: undefined,
        orderCount: 0,
        inCartCount: 0,
        isPopular: false,
        createdAt: now,
        updatedAt: now,
      }));

      const productId = await ctx.db.insert('products', {
        isDeleted: false,
        categoryId: categoryDoc?._id as Id<'categories'> | undefined,
        postedById: adminUser._id,
        organizationId: organization._id,
        categoryInfo: categoryDoc ? { name: categoryDoc.name, description: categoryDoc.description } : undefined,
        creatorInfo: {
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          email: adminUser.email,
          imageUrl: adminUser.imageUrl,
        },
        organizationInfo: {
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
        },
        slug: p.slug,
        title: p.title,
        isActive: true,
        description: p.description,
        discountLabel: p.discountLabel,
        supposedPrice: undefined,
        rating: 0,
        reviewsCount: 0,
        imageUrl: p.imageUrl,
        tags: p.tags ?? [],
        isBestPrice: p.isBestPrice ?? false,
        inventory: p.inventory,
        inventoryType: p.inventoryType,
        variants: processedVariants,
        recentReviews: [],
        totalVariants: processedVariants.length,
        minPrice,
        maxPrice,
        totalOrders: 0,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      });
      const created = await ctx.db.get(productId);
      if (created) productDocs.push(created);

      if (categoryDoc) {
        const catDoc = await ctx.db.get(categoryDoc._id);
        if (catDoc) {
          await ctx.db.patch(categoryDoc._id, {
            productCount: catDoc.productCount + 1,
            activeProductCount: catDoc.activeProductCount + 1,
            updatedAt: Date.now(),
          });
        }
      }
    }

    // 5) Seed additional users (staff and customers)
    const moreUsersData = [
      {
        email: 'staff1@merchkins.test',
        firstName: 'Staff',
        lastName: 'One',
        isStaff: true,
        isAdmin: false,
      },
      {
        email: 'staff2@merchkins.test',
        firstName: 'Staff',
        lastName: 'Two',
        isStaff: true,
        isAdmin: false,
      },
      {
        email: 'customer1@merchkins.test',
        firstName: 'Customer',
        lastName: 'Alpha',
        isStaff: false,
        isAdmin: false,
      },
      {
        email: 'customer2@merchkins.test',
        firstName: 'Customer',
        lastName: 'Beta',
        isStaff: false,
        isAdmin: false,
      },
    ];

    const usersByEmail: Record<string, Doc<'users'>> = {
      [adminUser.email]: adminUser,
    };

    for (const u of moreUsersData) {
      let existing = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', u.email))
        .first();
      if (!existing) {
        const id = await ctx.db.insert('users', {
          isDeleted: false,
          clerkId: `seed_${u.email}`,
          isOnboarded: true,
          firstName: u.firstName,
          lastName: u.lastName,
          managerId: undefined,
          managerInfo: undefined,
          imageUrl: undefined,
          email: u.email,
          phone: '0000000000',
          isStaff: u.isStaff,
          isAdmin: u.isAdmin,
          isSetupDone: true,
          isMerchant: !u.isAdmin && u.isStaff ? false : true,
          cartId: undefined,
          permissions: undefined,
          totalOrders: 0,
          totalSpent: 0,
          reviewCount: 0,
          lastLoginAt: now,
          lastOrderAt: undefined,
          organizationMemberships: undefined,
          profileVisibility: 'public',
          notificationPrefs: {
            emailNotifications: true,
            pushNotifications: true,
            orderUpdates: true,
            promotionalEmails: false,
          },
          createdAt: now,
          updatedAt: now,
        });
        existing = await ctx.db.get(id);
      }
      if (existing) usersByEmail[existing.email] = existing;
    }

    // 6) Organization memberships and permissions
    const orgMemberIds: Array<Id<'organizationMembers'>> = [];
    for (const email of Object.keys(usersByEmail)) {
      const user = usersByEmail[email]!;
      const role = user.email === adminEmail ? 'ADMIN' : user.isStaff ? 'STAFF' : 'MEMBER';
      const membershipInOrg = await ctx.db
        .query('organizationMembers')
        .withIndex('by_user_organization', (q) => q.eq('userId', user._id).eq('organizationId', organization._id))
        .first();
      let memberId: Id<'organizationMembers'> | undefined = membershipInOrg?._id;
      if (!membershipInOrg) {
        memberId = await ctx.db.insert('organizationMembers', {
          userId: user._id,
          organizationId: organization._id,
          userInfo: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            imageUrl: user.imageUrl,
            isStaff: user.isStaff,
          },
          organizationInfo: {
            name: organization.name,
            slug: organization.slug,
            logo: organization.logo,
            organizationType: 'PUBLIC',
          },
          role: role as 'ADMIN' | 'STAFF' | 'MEMBER',
          isActive: true,
          joinedAt: now,
          lastActiveAt: now,
          permissions: [
            {
              permissionCode: 'PRODUCT_MANAGEMENT',
              canCreate: role !== 'MEMBER',
              canRead: true,
              canUpdate: role !== 'MEMBER',
              canDelete: role === 'ADMIN',
            },
          ],
          orderCount: 0,
          messageCount: 0,
          lastOrderAt: undefined,
          updatedAt: now,
        });
      }
      if (memberId) orgMemberIds.push(memberId);

      // Patch user with membership reference
      const userDoc = await ctx.db.get(user._id);
      const memberships = userDoc?.organizationMemberships ?? [];
      const exists = memberships.some((m) => m.organizationId === organization._id);
      if (!exists) {
        memberships.push({
          organizationId: organization._id,
          organizationName: organization.name,
          organizationSlug: organization.slug,
          role,
          isActive: true,
          joinedAt: now,
        });
        await ctx.db.patch(user._id, {
          organizationMemberships: memberships,
          updatedAt: Date.now(),
        });
      }
    }

    // 7) Invite links
    const existingInvite = await ctx.db
      .query('organizationInviteLinks')
      .withIndex('by_organization', (q) => q.eq('organizationId', organization._id))
      .first();
    if (!existingInvite) {
      await ctx.db.insert('organizationInviteLinks', {
        organizationId: organization._id,
        code: 'WELCOME-1234',
        createdById: adminUser._id,
        creatorInfo: {
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          email: adminUser.email,
          imageUrl: adminUser.imageUrl,
        },
        organizationInfo: {
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
        },
        expiresAt: undefined,
        isActive: true,
        usageLimit: 100,
        usedCount: 0,
        usedBy: [],
        createdAt: now,
        updatedAt: now,
      });
    }

    // 8) Global permissions catalogue
    const permissionCatalog = [
      {
        code: 'USER_VIEW',
        name: 'View Users',
        category: 'USER_MANAGEMENT' as const,
      },
      {
        code: 'PRODUCT_EDIT',
        name: 'Edit Products',
        category: 'PRODUCT_MANAGEMENT' as const,
      },
      {
        code: 'ORDER_MANAGE',
        name: 'Manage Orders',
        category: 'ORDER_MANAGEMENT' as const,
      },
      {
        code: 'PAYMENT_REFUND',
        name: 'Process Refunds',
        category: 'PAYMENT_MANAGEMENT' as const,
      },
      {
        code: 'ORG_SETTINGS',
        name: 'Organization Settings',
        category: 'ORGANIZATION_MANAGEMENT' as const,
      },
      {
        code: 'SYSTEM_ADMIN',
        name: 'System Administration',
        category: 'SYSTEM_ADMINISTRATION' as const,
      },
    ];
    for (const p of permissionCatalog) {
      const exists = await ctx.db
        .query('permissions')
        .withIndex('by_code', (q) => q.eq('code', p.code))
        .first();
      if (!exists) {
        await ctx.db.insert('permissions', {
          code: p.code,
          name: p.name,
          description: undefined,
          category: p.category,
          defaultSettings: {
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: false,
          },
          isActive: true,
          isSystemPermission: p.code === 'SYSTEM_ADMIN',
          requiredRole: p.code === 'SYSTEM_ADMIN' ? 'ADMIN' : undefined,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // 9) Sample cart for customer1
    const customer1 = usersByEmail['customer1@merchkins.test'];
    if (customer1 && productDocs.length > 0) {
      const cartExists = await ctx.db
        .query('carts')
        .withIndex('by_user', (q) => q.eq('userId', customer1._id))
        .first();
      if (!cartExists) {
        const itemProduct = productDocs[0]!;
        const itemVariant = itemProduct.variants[0];
        const cartId = await ctx.db.insert('carts', {
          userId: customer1._id,
          userInfo: {
            firstName: customer1.firstName,
            lastName: customer1.lastName,
            email: customer1.email,
            imageUrl: customer1.imageUrl,
          },
          embeddedItems: [
            {
              variantId: undefined,
              productInfo: {
                productId: itemProduct._id,
                title: itemProduct.title,
                slug: itemProduct.slug,
                imageUrl: itemProduct.imageUrl,
                variantName: itemVariant?.variantName,
                price: itemVariant?.price ?? itemProduct.minPrice ?? 1000,
                originalPrice: itemProduct.supposedPrice,
                inventory: itemVariant?.inventory ?? itemProduct.inventory,
              },
              quantity: 2,
              selected: true,
              note: 'Gift wrap please',
              addedAt: now,
            },
          ],
          totalItems: 2,
          selectedItems: 2,
          totalValue: (itemVariant?.price ?? 1000) * 2,
          selectedValue: (itemVariant?.price ?? 1000) * 2,
          lastActivity: now,
          isAbandoned: false,
          abandonedAt: undefined,
          createdAt: now,
          updatedAt: now,
        });
        await ctx.db.patch(customer1._id, { cartId });
      }
    }

    // 10) Sample order with embedded items and order items
    const processor = usersByEmail['staff1@merchkins.test'] ?? adminUser;
    const orderCustomer = customer1 ?? adminUser;
    let createdOrderId: Id<'orders'> | undefined;
    {
      const existingOrder = await ctx.db
        .query('orders')
        .withIndex('by_customer', (q) => q.eq('customerId', orderCustomer._id))
        .first();
      if (!existingOrder && productDocs.length >= 2) {
        const p1 = productDocs[0]!;
        const p2 = productDocs[1]!;
        const v1 = p1.variants[0];
        const v2 = p2.variants[0];
        const embeddedItems = [
          {
            variantId: v1?.variantId,
            productInfo: {
              productId: p1._id,
              title: p1.title,
              slug: p1.slug,
              imageUrl: p1.imageUrl,
              variantName: v1?.variantName,
              categoryName: categoryBySlug['t-shirts']?.name,
            },
            quantity: 1,
            price: v1?.price ?? 1000,
            originalPrice: v1?.price ?? 1000,
            appliedRole: 'sale',
            customerNote: 'No special instructions',
          },
          {
            variantId: v2?.variantId,
            productInfo: {
              productId: p2._id,
              title: p2.title,
              slug: p2.slug,
              imageUrl: p2.imageUrl,
              variantName: v2?.variantName,
              categoryName: categoryBySlug['hoodies']?.name,
            },
            quantity: 2,
            price: v2?.price ?? 3000,
            originalPrice: v2?.price ?? 3000,
            appliedRole: 'sale',
            customerNote: undefined,
          },
        ];
        const totalAmount = embeddedItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
        createdOrderId = await ctx.db.insert('orders', {
          isDeleted: false,
          organizationId: organization._id,
          customerId: orderCustomer._id,
          processedById: processor._id,
          customerInfo: {
            firstName: orderCustomer.firstName,
            lastName: orderCustomer.lastName,
            email: orderCustomer.email,
            phone: orderCustomer.phone || '',
            imageUrl: orderCustomer.imageUrl,
          },
          processorInfo: {
            firstName: processor.firstName,
            lastName: processor.lastName,
            email: processor.email,
            imageUrl: processor.imageUrl,
          },
          organizationInfo: {
            name: organization.name,
            slug: organization.slug,
            logo: organization.logo,
          },
          orderDate: now - 1000 * 60 * 60 * 24,
          orderNumber: `ORD-${now}`,
          status: 'PROCESSING',
          paymentStatus: 'DOWNPAYMENT',
          cancellationReason: undefined,
          embeddedItems,
          totalAmount,
          discountAmount: 0,
          itemCount: embeddedItems.reduce((s, it) => s + it.quantity, 0),
          uniqueProductCount: embeddedItems.length,
          estimatedDelivery: now + 1000 * 60 * 60 * 24 * 5,
          customerSatisfactionSurveyId: undefined,
          customerNotes: 'Please deliver between 9am-5pm',
          paymentPreference: 'DOWNPAYMENT',
          recentStatusHistory: [
            {
              status: 'PENDING',
              changedBy: processor._id,
              changedByName: `${processor.firstName ?? ''} ${processor.lastName ?? ''}`.trim(),
              reason: 'Order created',
              changedAt: now - 1000 * 60 * 60,
            },
            {
              status: 'PROCESSING',
              changedBy: processor._id,
              changedByName: `${processor.firstName ?? ''} ${processor.lastName ?? ''}`.trim(),
              reason: 'Preparing items',
              changedAt: now - 1000 * 60 * 30,
            },
          ],
          createdAt: now,
          updatedAt: now,
        });

        // Separate order items for demonstration
        if (createdOrderId) {
          for (const it of embeddedItems) {
            await ctx.db.insert('orderItems', {
              orderId: createdOrderId,
              variantId: it.variantId,
              productInfo: it.productInfo,
              quantity: it.quantity,
              price: it.price,
              originalPrice: it.originalPrice,
              appliedRole: it.appliedRole,
              customerNote: it.customerNote,
              size: 'M',
              createdAt: now,
              updatedAt: now,
            });
          }
          await ctx.db.insert('orderLogs', {
            createdById: processor._id,
            orderId: createdOrderId,
            isSystemLog: true,
            creatorInfo: {
              firstName: processor.firstName,
              lastName: processor.lastName,
              email: processor.email,
              imageUrl: processor.imageUrl,
            },
            orderInfo: {
              orderNumber: `ORD-${now}`,
              customerName: `${orderCustomer.firstName ?? ''} ${orderCustomer.lastName ?? ''}`.trim(),
              status: 'PROCESSING',
              totalAmount,
            },
            reason: 'Order moved to processing',
            message: 'Picking items',
            userMessage: 'Your order is now processing',
            logType: 'STATUS_CHANGE',
            previousValue: 'PENDING',
            newValue: 'PROCESSING',
            isPublic: true,
            createdAt: now,
            updatedAt: now,
          });
        }
      } else if (existingOrder) {
        createdOrderId = existingOrder._id;
      }
    }

    // 11) Payment for the order
    if (createdOrderId) {
      const order = await ctx.db.get(createdOrderId);
      if (order) {
        const existingPayment = await ctx.db
          .query('payments')
          .withIndex('by_order', (q) => q.eq('orderId', order._id))
          .first();
        if (!existingPayment) {
          await ctx.db.insert('payments', {
            isDeleted: false,
            organizationId: organization._id,
            orderId: order._id,
            userId: order.customerId,
            processedById: processor._id,
            orderInfo: {
              orderNumber: order.orderNumber,
              customerName: `${order.customerInfo.firstName ?? ''} ${order.customerInfo.lastName ?? ''}`.trim(),
              customerEmail: order.customerInfo.email,
              totalAmount: order.totalAmount,
              orderDate: order.orderDate,
              status: order.status,
            },
            userInfo: {
              firstName: order.customerInfo.firstName,
              lastName: order.customerInfo.lastName,
              email: order.customerInfo.email,
              phone: order.customerInfo.phone,
              imageUrl: order.customerInfo.imageUrl,
            },
            processorInfo: {
              firstName: processor.firstName,
              lastName: processor.lastName,
              email: processor.email,
              imageUrl: processor.imageUrl,
            },
            organizationInfo: {
              name: organization.name,
              slug: organization.slug,
              logo: organization.logo,
            },
            paymentDate: now,
            amount: Math.round(order.totalAmount / 2),
            paymentMethod: 'XENDIT',
            paymentSite: 'ONSITE',
            paymentStatus: 'VERIFIED',
            referenceNo: `PAY-${now}`,
            memo: 'Downpayment received',
            currency: 'PHP',
            transactionId: `TX-${now}`,
            paymentProvider: 'MockProvider',
            metadata: { channel: 'counter' },
            verificationDate: now,
            reconciliationStatus: 'MATCHED',
            processingFee: 0,
            netAmount: Math.round(order.totalAmount / 2),
            statusHistory: [
              {
                status: 'PENDING',
                changedBy: processor._id,
                changedByName: `${processor.firstName ?? ''} ${processor.lastName ?? ''}`.trim(),
                reason: 'Awaiting payment',
                changedAt: now - 1000 * 60 * 10,
              },
              {
                status: 'VERIFIED',
                changedBy: processor._id,
                changedByName: `${processor.firstName ?? ''} ${processor.lastName ?? ''}`.trim(),
                reason: 'Payment verified',
                changedAt: now,
              },
            ],
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    // 12) Reviews for a product
    {
      const reviewer = usersByEmail['customer2@merchkins.test'] ?? orderCustomer;
      const product = productDocs[0];
      if (reviewer && product) {
        const existing = await ctx.db
          .query('reviews')
          .withIndex('by_product', (q) => q.eq('productId', product._id))
          .first();
        if (!existing) {
          const reviewId = await ctx.db.insert('reviews', {
            productId: product._id,
            userId: reviewer._id,
            userInfo: {
              firstName: reviewer.firstName,
              lastName: reviewer.lastName,
              email: reviewer.email,
              imageUrl: reviewer.imageUrl,
              courses: 'N/A',
            },
            productInfo: {
              title: product.title,
              slug: product.slug,
              imageUrl: product.imageUrl,
              organizationId: product.organizationId,
              organizationName: organization.name,
            },
            rating: 5,
            comment: 'Great quality and fit!',
            isVerifiedPurchase: true,
            orderId: createdOrderId,
            helpfulCount: 2,
            reportCount: 0,
            isModerated: false,
            merchantResponse: undefined,
            createdAt: now,
            updatedAt: now,
          });
          const prodDoc = await ctx.db.get(product._id);
          if (prodDoc) {
            const recent = prodDoc.recentReviews ?? [];
            recent.unshift({
              reviewId,
              userId: reviewer._id,
              userName: `${reviewer.firstName ?? ''} ${reviewer.lastName ?? ''}`.trim(),
              userImage: reviewer.imageUrl,
              rating: 5,
              comment: 'Great quality and fit!',
              createdAt: now,
            });
            await ctx.db.patch(product._id, {
              reviewsCount: (prodDoc.reviewsCount ?? 0) + 1,
              rating: 5,
              recentReviews: recent.slice(0, 5),
              updatedAt: Date.now(),
            });
          }
        }
      }
    }

    // 13) Messages (contact form style)
    {
      const cust = usersByEmail['customer1@merchkins.test'] ?? orderCustomer;
      const assigned = processor;
      const existingMsg = await ctx.db
        .query('messages')
        .withIndex('by_email', (q) => q.eq('email', cust.email))
        .first();
      let rootMsgId: Id<'messages'> | undefined = existingMsg?._id;
      if (!existingMsg) {
        rootMsgId = await ctx.db.insert('messages', {
          organizationId: organization._id,
          isArchived: false,
          isRead: false,
          isResolved: false,
          isSentByCustomer: true,
          isSentByAdmin: false,
          repliesToId: undefined,
          sentBy: cust._id,
          senderInfo: {
            firstName: cust.firstName,
            lastName: cust.lastName,
            email: cust.email,
            imageUrl: cust.imageUrl,
            isStaff: cust.isStaff,
            isAdmin: cust.isAdmin,
          },
          organizationInfo: {
            name: organization.name,
            slug: organization.slug,
            logo: organization.logo,
          },
          replyToInfo: undefined,
          email: cust.email,
          subject: 'Order inquiry',
          message: 'Can I change the delivery address?',
          messageType: 'SUPPORT',
          priority: 'NORMAL',
          conversationId: `conv-${now}`,
          threadDepth: 0,
          attachments: undefined,
          responseTime: undefined,
          assignedTo: assigned._id,
          assigneeInfo: {
            firstName: assigned.firstName,
            lastName: assigned.lastName,
            email: assigned.email,
            imageUrl: assigned.imageUrl,
          },
          tags: ['order', 'delivery'],
          sentimentScore: 0.2,
          urgencyScore: 0.3,
          createdAt: now,
          updatedAt: now,
        });
      }
      if (rootMsgId) {
        await ctx.db.insert('messages', {
          organizationId: organization._id,
          isArchived: false,
          isRead: true,
          isResolved: false,
          isSentByCustomer: false,
          isSentByAdmin: true,
          repliesToId: rootMsgId,
          sentBy: assigned._id,
          senderInfo: {
            firstName: assigned.firstName,
            lastName: assigned.lastName,
            email: assigned.email,
            imageUrl: assigned.imageUrl,
            isStaff: assigned.isStaff,
            isAdmin: assigned.isAdmin,
          },
          organizationInfo: {
            name: organization.name,
            slug: organization.slug,
            logo: organization.logo,
          },
          replyToInfo: {
            subject: 'Order inquiry',
            message: 'Can I change the delivery address?',
            senderName: `${orderCustomer.firstName ?? ''} ${orderCustomer.lastName ?? ''}`.trim(),
            sentAt: now,
          },
          email: assigned.email,
          subject: 'Re: Order inquiry',
          message: 'Yes, please provide the new address.',
          messageType: 'REPLY',
          priority: 'NORMAL',
          conversationId: `conv-${now}`,
          threadDepth: 1,
          attachments: undefined,
          responseTime: 5 * 60 * 1000,
          assignedTo: assigned._id,
          assigneeInfo: {
            firstName: assigned.firstName,
            lastName: assigned.lastName,
            email: assigned.email,
            imageUrl: assigned.imageUrl,
          },
          tags: ['support'],
          sentimentScore: 0.4,
          urgencyScore: 0.2,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // 14) Announcements
    {
      const existing = await ctx.db
        .query('announcements')
        .withIndex('by_pinned', (q) => q.eq('isPinned', true))
        .first();
      if (!existing) {
        await ctx.db.insert('announcements', {
          organizationId: organization._id,
          title: 'Welcome to Merchkins!',
          type: 'NORMAL',
          level: 'INFO',
          publishedById: adminUser._id,
          publisherInfo: {
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            email: adminUser.email,
            imageUrl: adminUser.imageUrl,
            isAdmin: true,
          },
          organizationInfo: {
            name: organization.name,
            slug: organization.slug,
            logo: organization.logo,
          },
          content: 'We are live with seeded data for testing!',
          contentType: 'TEXT',
          targetAudience: 'ALL',
          publishedAt: now,
          scheduledAt: undefined,
          expiresAt: undefined,
          viewCount: 0,
          acknowledgedBy: [],
          isActive: true,
          isPinned: true,
          requiresAcknowledgment: false,
          attachments: undefined,
          clickCount: 0,
          dismissCount: 0,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // 15) Survey categories and responses
    let surveyCategoryId: Id<'surveyCategories'> | undefined;
    {
      const existingCat = await ctx.db
        .query('surveyCategories')
        .withIndex('by_name', (q) => q.eq('name', 'Post-Purchase'))
        .first();
      if (!existingCat) {
        surveyCategoryId = await ctx.db.insert('surveyCategories', {
          isDeleted: false,
          name: 'Post-Purchase',
          description: 'Measure customer satisfaction after order',
          questions: {
            question1: { text: 'Product quality', type: 'rating', weight: 1 },
            question2: { text: 'Delivery speed', type: 'rating', weight: 1 },
            question3: { text: 'Customer support', type: 'rating', weight: 1 },
            question4: { text: 'Value for money', type: 'rating', weight: 1 },
          },
          question1: 'Product quality',
          question2: 'Delivery speed',
          question3: 'Customer support',
          question4: 'Value for money',
          totalResponses: 0,
          averageScore: 0,
          positiveResponseRate: 0,
          isActive: true,
          isDefault: true,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        surveyCategoryId = existingCat._id;
      }
    }
    if (surveyCategoryId && createdOrderId) {
      const order = await ctx.db.get(createdOrderId);
      if (order) {
        const overall = 4.5;
        await ctx.db.insert('surveyResponses', {
          orderId: order._id,
          categoryId: surveyCategoryId,
          orderInfo: {
            customerName: `${order.customerInfo.firstName ?? ''} ${order.customerInfo.lastName ?? ''}`.trim(),
            customerEmail: order.customerInfo.email,
            organizationName: organization.name,
            totalAmount: order.totalAmount,
            orderDate: order.orderDate,
            itemCount: order.itemCount,
          },
          categoryInfo: { name: 'Post-Purchase', description: undefined },
          surveyData: {
            question1: { question: 'Product quality', answer: 5 },
            question2: { question: 'Delivery speed', answer: 4 },
            question3: { question: 'Customer support', answer: 5 },
            question4: { question: 'Value for money', answer: 4 },
          },
          submitDate: now,
          answers: {
            question1: 5,
            question2: 4,
            question3: 5,
            question4: 4,
          },
          metadata: { source: 'email' },
          comments: 'Great experience overall!',
          overallScore: overall,
          isPositive: overall >= 3.5,
          responseTime: 2 * 60 * 1000,
          needsFollowUp: false,
          followUpSent: false,
          followUpDate: undefined,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // 16) Tickets and updates
    let ticketId: Id<'tickets'> | undefined;
    {
      const existing = await ctx.db
        .query('tickets')
        .withIndex('by_creator', (q) => q.eq('createdById', orderCustomer._id))
        .first();
      if (!existing) {
        ticketId = await ctx.db.insert('tickets', {
          title: 'Wrong item received',
          description: 'I received a different color than ordered.',
          status: 'OPEN',
          priority: 'MEDIUM',
          createdById: orderCustomer._id,
          assignedToId: processor._id,
          creatorInfo: {
            firstName: orderCustomer.firstName,
            lastName: orderCustomer.lastName,
            email: orderCustomer.email,
            imageUrl: orderCustomer.imageUrl,
          },
          assigneeInfo: {
            firstName: processor.firstName,
            lastName: processor.lastName,
            email: processor.email,
            imageUrl: processor.imageUrl,
          },
          recentUpdates: [],
          updates: undefined,
          updateCount: 0,
          responseTime: undefined,
          resolutionTime: undefined,
          category: 'SUPPORT',
          tags: ['order', 'quality'],
          dueDate: now + 1000 * 60 * 60 * 24 * 3,
          escalated: false,
          escalatedAt: undefined,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        ticketId = existing._id;
      }
    }
    if (ticketId) {
      const updateId = await ctx.db.insert('ticketUpdates', {
        ticketId,
        update: 'OPEN',
        createdById: processor._id,
        creatorInfo: {
          firstName: processor.firstName,
          lastName: processor.lastName,
          email: processor.email,
          imageUrl: processor.imageUrl,
        },
        ticketInfo: {
          title: 'Wrong item received',
          priority: 'MEDIUM',
          category: 'SUPPORT',
        },
        content: 'Ticket created and assigned to support staff.',
        updateType: 'COMMENT',
        previousValue: undefined,
        newValue: undefined,
        attachments: undefined,
        isInternal: false,
        createdAt: now,
        updatedAt: now,
      });
      const t = await ctx.db.get(ticketId);
      if (t) {
        const recent = t.recentUpdates ?? [];
        recent.unshift({
          updateId,
          update: 'OPEN',
          content: 'Ticket created and assigned to support staff.',
          createdById: processor._id,
          creatorName: `${processor.firstName ?? ''} ${processor.lastName ?? ''}`.trim(),
          createdAt: now,
        });
        await ctx.db.patch(ticketId, {
          recentUpdates: recent.slice(0, 5),
          updateCount: (t.updateCount ?? 0) + 1,
          updatedAt: Date.now(),
        });
      }
    }

    // 17) Chats: room, participants, messages, reactions, state
    let chatRoomId: Id<'chatRooms'> | undefined;
    {
      const existing = await ctx.db
        .query('chatRooms')
        .withIndex('by_type', (q) => q.eq('type', 'group'))
        .first();
      if (!existing) {
        chatRoomId = await ctx.db.insert('chatRooms', {
          name: 'General',
          description: 'Team communications',
          type: 'group',
          organizationId: organization._id,
          createdBy: adminUser._id,
          isActive: true,
          lastMessageAt: now,
          createdByInfo: {
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            imageUrl: adminUser.imageUrl,
            email: adminUser.email,
          },
          embeddedParticipants: undefined,
          participantCount: 3,
          unreadMessageCount: 0,
          lastMessagePreview: 'Welcome to the channel!',
          lastMessageSenderId: adminUser._id,
          currentlyTyping: [],
          createdAt: now,
          updatedAt: now,
        });
      } else {
        chatRoomId = existing._id;
      }
    }
    if (chatRoomId) {
      const staff1 = usersByEmail['staff1@merchkins.test'];
      const staff2 = usersByEmail['staff2@merchkins.test'];
      const participants = [adminUser, staff1, staff2].filter(Boolean) as Array<Doc<'users'>>;
      for (const p of participants) {
        const exists = await ctx.db
          .query('chatParticipants')
          .withIndex('by_chat_and_user', (q) => q.eq('chatRoomId', chatRoomId!).eq('userId', p._id))
          .first();
        if (!exists) {
          await ctx.db.insert('chatParticipants', {
            chatRoomId: chatRoomId!,
            userId: p._id,
            userInfo: {
              firstName: p.firstName,
              lastName: p.lastName,
              imageUrl: p.imageUrl,
              email: p.email,
            },
            role: p._id === adminUser._id ? 'admin' : 'member',
            joinedAt: now,
            lastReadAt: now,
            isActive: true,
            notificationSettings: {
              mentions: true,
              allMessages: true,
              reactions: true,
            },
          });
        }
      }
      const welcomeId = await ctx.db.insert('chatMessages', {
        chatRoomId,
        senderId: adminUser._id,
        senderInfo: {
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          imageUrl: adminUser.imageUrl,
          email: adminUser.email,
        },
        content: 'Welcome to the channel!',
        messageType: 'system',
        attachments: undefined,
        replyToId: undefined,
        replyToInfo: undefined,
        reactions: [],
        isEdited: false,
        editHistory: undefined,
        isDeleted: false,
        isPinned: true,
        readBy: participants.map((u) => ({ userId: u._id, readAt: now })),
        mentions: [],
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert('messageReactions', {
        messageId: welcomeId,
        userId: participants[1]!._id,
        emoji: '👍',
        userInfo: {
          firstName: participants[1]!.firstName,
          lastName: participants[1]!.lastName,
          imageUrl: participants[1]!.imageUrl,
        },
        createdAt: now,
      });
      await ctx.db.insert('chatRoomState', {
        chatRoomId,
        activeUsers: participants.map((u) => ({
          userId: u._id,
          firstName: u.firstName,
          imageUrl: u.imageUrl,
          lastSeenAt: now,
          isOnline: true,
        })),
        typingUsers: [],
        unreadCounts: participants.map((u) => ({
          userId: u._id,
          count: 0,
          lastReadMessageId: welcomeId,
          lastReadAt: now,
        })),
        updatedAt: now,
      });
    }

    // 18) Logs
    await ctx.db.insert('logs', {
      organizationId: organization._id,
      userId: orderCustomer._id,
      createdById: adminUser._id,
      userInfo: {
        firstName: orderCustomer.firstName,
        lastName: orderCustomer.lastName,
        email: orderCustomer.email,
        imageUrl: orderCustomer.imageUrl,
      },
      creatorInfo: {
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        imageUrl: adminUser.imageUrl,
      },
      organizationInfo: {
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
      },
      createdDate: now,
      reason: 'Seed data created',
      systemText: 'Initial seed completed',
      userText: 'Your workspace is ready with sample data.',
      logType: 'SYSTEM_EVENT',
      severity: 'LOW',
      resourceType: 'seed',
      resourceId: 'seed-001',
      action: 'create',
      metadata: { version: 1 },
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
      previousValue: undefined,
      newValue: undefined,
      correlationId: `seed-${now}`,
      sessionId: undefined,
      isArchived: false,
      archivedAt: undefined,
    });

    return { ok: true } as const;
  },
});
