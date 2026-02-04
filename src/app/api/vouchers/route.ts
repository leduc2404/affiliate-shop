import { NextResponse } from 'next/server';

const DEFAULT_LINK_VOUCHER = "https://s.shopee.vn/6AfHL1EZ77";
const DEFAULT_LINK_TRANG_CHU = "https://s.shopee.vn/1La1aBN5lL";

export async function GET() {
  try {
    const v_param = Date.now();
    const url = `https://www.shopeeanalytics.com/api/voucher/data/voucher-list-today_list.txt?v=${v_param}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        'Referer': 'https://www.shopeeanalytics.com/vn/ma-giam-gia.html',
        'x-requested-with': 'XMLHttpRequest',
        'Accept': 'text/html, */*; q=0.01',
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: `API error: ${response.status}`,
        total: 0,
        vouchers: []
      });
    }

    const html = await response.text();
    
    // Parse HTML to extract voucher data
    const vouchers = parseVoucherHtml(html);
    
    return NextResponse.json({
      success: true,
      message: `Tìm thấy ${vouchers.length} mã giảm giá`,
      total: vouchers.length,
      vouchers
    });
    
  } catch (error) {
    console.error('Voucher API error:', error);
    return NextResponse.json({
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      total: 0,
      vouchers: []
    });
  }
}

interface Voucher {
  ma: string;
  phan_loai: string;
  noi_dung: string;
  tinh_trang: string;
  logo: string;
  link_voucher: string;
  link_trang_chu: string;
}

function parseVoucherHtml(html: string): Voucher[] {
  const vouchers: Voucher[] = [];
  
  // Match voucher items - capture the li tag attributes too
  const itemRegex = /<li[^>]*class="[^"]*bc_voucher_item[^"]*"[^>]*data-cat="([^"]*)"[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  
  while ((match = itemRegex.exec(html)) !== null) {
    const phan_loai = match[1] || '';
    const itemHtml = match[2];
    
    // Extract voucher code
    const codeMatch = itemHtml.match(/data-code="([^"]+)"/);
    const ma = codeMatch ? codeMatch[1] : '';
    
    // Extract title/content
    const titleMatch = itemHtml.match(/<div[^>]*class="[^"]*bc_voucher_title[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    let noi_dung = '';
    if (titleMatch) {
      noi_dung = titleMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    // Extract status
    const statusMatch = itemHtml.match(/<div[^>]*class="[^"]*bc_voucher_desc_item[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    let tinh_trang = '';
    if (statusMatch) {
      tinh_trang = statusMatch[1].replace(/<[^>]+>/g, '').trim();
    }
    
    // Extract logo
    const logoMatch = itemHtml.match(/data-src="([^"]+)"/);
    const logo = logoMatch ? logoMatch[1] : '';
    
    if (ma) {
      vouchers.push({
        ma,
        phan_loai,
        noi_dung,
        tinh_trang,
        logo,
        link_voucher: DEFAULT_LINK_VOUCHER,
        link_trang_chu: DEFAULT_LINK_TRANG_CHU
      });
    }
  }
  
  return vouchers;
}
