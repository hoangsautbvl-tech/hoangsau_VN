const $ = id => document.getElementById(id);

const MAP_FRAME_VERSION = '20260502-popup-fit';

const quizCategoryLabels = {
  1: 'HĂ  Ná»™i',
  2: 'Cao Báº±ng',
  3: 'TuyĂªn Quang',
  4: 'Äiá»‡n BiĂªn',
  5: 'Lai ChĂ¢u',
  6: 'SÆ¡n La',
  7: 'LĂ o Cai',
  8: 'ThĂ¡i NguyĂªn',
  9: 'Láº¡ng SÆ¡n',
  10: 'Quáº£ng Ninh',
  11: 'Báº¯c Ninh',
  12: 'PhĂº Thá»',
  13: 'Háº£i PhĂ²ng',
  14: 'HÆ°ng YĂªn',
  15: 'Ninh BĂ¬nh',
  16: 'Thanh HĂ³a',
  17: 'Nghá»‡ An',
  18: 'HĂ  TÄ©nh',
  19: 'Quáº£ng Trá»‹',
  20: 'Huáº¿',
  21: 'ÄĂ  Náºµng',
  22: 'Quáº£ng NgĂ£i',
  23: 'Gia Lai',
  24: 'KhĂ¡nh HĂ²a',
  25: 'Äáº¯k Láº¯k',
  26: 'LĂ¢m Äá»“ng',
  27: 'Äá»“ng Nai',
  28: 'ThĂ nh phá»‘ Há»“ ChĂ­ Minh',
  29: 'TĂ¢y Ninh',
  30: 'Äá»“ng ThĂ¡p',
  31: 'VÄ©nh Long',
  32: 'An Giang',
  33: 'Cáº§n ThÆ¡',
  34: 'CĂ  Mau',
  35: 'Quáº§n Ä‘áº£o TrÆ°á»ng Sa',
  36: 'Quáº§n Ä‘áº£o HoĂ ng Sa',
};

const provinceCodeToQuizCategory = {
  '01': '1',
  '04': '2',
  '08': '3',
  '30': '4',
  '31': '5',
  '33': '6',
  '26': '7',
  '12': '8',
  '11': '9',
  '14': '10',
  '19': '11',
  '25': '12',
  '20': '13',
  '22': '14',
  '24': '15',
  '36': '16',
  '38': '17',
  '40': '18',
  '42': '19',
  '44': '20',
  '46': '21',
  '48': '22',
  '51': '23',
  '56': '24',
  '66': '25',
  '68': '26',
  '75': '27',
  '79': '28',
  '80': '29',
  '82': '30',
  '86': '31',
  '91': '32',
  '92': '33',
  '96': '34',
};

const state = {
  provinces: [],
  selectedCode: '86',
  activeView: 'map-view',
  mapDirectMode: false,
  mapFrameLoaded: false,
  quizQuestions: [],
  currentQuiz: [],
  currentQuestion: null,
  questionIndex: 0,
  score: 0,
  timeLeft: 20,
  timerId: null,
  soundOn: true,
  mergeRows: [],
  communeRows: [],
};

const provinceProfiles = {
  '68': {
    overview: 'Lâm Đồng sau sáp nhập hội tụ không gian cao nguyên, nông nghiệp công nghệ cao, du lịch nghỉ dưỡng - văn hóa và các vùng sản xuất nông sản đặc trưng.',
    economy: [
      'Nông nghiệp công nghệ cao, nông nghiệp sinh thái và nông nghiệp hữu cơ là trụ cột nổi bật; các sản phẩm có lợi thế gồm cà phê, chè, rau, hoa Đà Lạt, dược liệu, trái cây ôn đới và mật ong.',
      'Du lịch tiếp tục là ngành kinh tế quan trọng, phát triển theo hướng nghỉ dưỡng, sinh thái, canh nông và cộng đồng.'
    ],
    culture: [
      'Không gian văn hóa Cồng chiêng Tây Nguyên, văn hóa K’Ho, Mạ, Chu Ru và dấu ấn kiến trúc Đà Lạt tạo bản sắc riêng cho du lịch văn hóa.',
      'Địa phương định hướng phát triển du lịch văn hóa, du lịch cộng đồng theo hướng bền vững, gắn với bảo tồn cảnh quan và bản sắc dân tộc.'
    ],
    society: [
      'Chương trình OCOP được gắn với xây dựng nông thôn mới, tạo việc làm, nâng cao thu nhập và phát huy nội lực cộng đồng.',
      'Không gian phát triển mới có sự liên kết cao nguyên, đô thị du lịch và vùng sản xuất nông nghiệp - dịch vụ.'
    ],
    products: ['Cà phê', 'Chè', 'Rau và hoa Đà Lạt', 'Dược liệu', 'Trái cây ôn đới', 'Mật ong', 'Sản phẩm OCOP'],
    stats: {
      total: 124,
      wards: 20,
      communes: 103,
      special: 1,
      source: 'Theo Nghị quyết 1671/NQ-UBTVQH15: 124 đơn vị cấp xã, gồm 103 xã, 20 phường, 1 đặc khu.'
    },
    images: [
      {
        src: '/python/assets/profile/lam-dong-da-lat.svg',
        caption: 'Đà Lạt - trung tâm du lịch cao nguyên'
      },
      {
        src: '/python/assets/profile/lam-dong-tea.svg',
        caption: 'Vùng chè, nông nghiệp cao nguyên'
      },
      {
        src: '/python/assets/profile/lam-dong-flowers.svg',
        caption: 'Hoa Đà Lạt - sản phẩm đặc trưng'
      }
    ],
    sources: [
      {
        label: 'Cổng Thông tin điện tử Chính phủ: danh sách 124 xã, phường, đặc khu của Lâm Đồng mới',
        url: 'https://xaydungchinhsach.chinhphu.vn/sap-xep-dvhc-danh-sach-124-xa-phuong-dac-khu-cua-tinh-lam-dong-moi-119250623065800248.htm'
      },
      {
        label: 'Thư viện Pháp luật: bản đồ Lâm Đồng và 124 đơn vị cấp xã sau sáp nhập',
        url: 'https://news.thuvienphapluat.vn/tintuc/vn/ho-tro-phap-luat/thong-tin-huu-ich/90839/ban-do-lam-dong-moi-nhat-chi-tiet-124-don-vi-cap-xa-sau-sap-nhap-cua-tinh-lam-dong'
      },
      {
        label: 'Cổng thông tin Lâm Đồng: OCOP tạo động lực xây dựng nông thôn mới',
        url: 'https://langbiang.lamdong.gov.vn/chi-tiet-tin-tuc/?param=ocop-tao-dong-luc-xay-dung-nong-thon-moi-ben-vung-o-lam-dong-a3809f02-ed6d-4f20-b9cd-a058993d5a0c'
      },
      {
        label: 'Cổng thông tin Lâm Đồng: phát triển du lịch văn hóa bền vững',
        url: 'https://langbiang.lamdong.gov.vn/chi-tiet-tin-tuc/?param=lam-dong-phat-trien-du-lich-van-hoa-theo-huong-ben-vung-a3809f02-ed6d-4f20-b9cd-a058993d5a0c'
      },
      {
        label: 'Cổng thông tin Lâm Đồng: phát triển du lịch cộng đồng',
        url: 'https://langbiang.lamdong.gov.vn/chi-tiet-tin-tuc/?param=lam-dong-phat-trien-du-lich-cong-dong-theo-huong-ben-vung-a3809f02-ed6d-4f20-b9cd-a058993d5a0c'
      },
      {
        label: 'Trung tâm Khuyến nông Lâm Đồng: kinh tế trang trại gắn du lịch nông nghiệp',
        url: 'https://khuyennong.lamdong.gov.vn/tin-tuc-su-kien/3030-l%C3%A2m-%C4%91%E1%BB%93ng-ph%C3%A1t-tri%E1%BB%83n-kinh-t%E1%BA%BF-trang-tr%E1%BA%A1i-g%E1%BA%AFn-v%E1%BB%9Bi-du-l%E1%BB%8Bch-n%C3%B4ng-nghi%E1%BB%87p'
      }
    ]
  },
  '75': {
    overview: 'Thành phố Đồng Nai được thành lập từ ngày 30/04/2026 trên cơ sở toàn bộ diện tích tự nhiên và quy mô dân số của tỉnh Đồng Nai, là thành phố trực thuộc Trung ương thứ 7 của Việt Nam.',
    economy: [
      'Đồng Nai là địa bàn công nghiệp - logistics lớn của vùng Đông Nam Bộ, có lợi thế về các khu công nghiệp, chế biến - chế tạo, cảng cạn, kho vận và kết nối với Thành phố Hồ Chí Minh.',
      'Không gian phát triển mới kết hợp Đồng Nai và Bình Phước, mở rộng dư địa cho công nghiệp, nông nghiệp công nghệ cao, kinh tế cửa khẩu, năng lượng và chuỗi cung ứng vùng.'
    ],
    culture: [
      'Địa phương có truyền thống văn hóa Đông Nam Bộ, di tích lịch sử cách mạng, văn hóa đô thị Biên Hòa và không gian văn hóa cộng đồng đa dạng.',
      'Các khu du lịch sinh thái, hồ Trị An, Vườn quốc gia Cát Tiên và hệ thống làng nghề - sản phẩm địa phương tạo thêm tài nguyên cho giáo dục, trải nghiệm và du lịch.'
    ],
    society: [
      'Việc trở thành thành phố trực thuộc Trung ương tạo yêu cầu mới về quản trị đô thị, hạ tầng giao thông, nhà ở, giáo dục, y tế và dịch vụ công.',
      'Đồng Nai giữ vai trò kết nối vùng giữa Thành phố Hồ Chí Minh, Lâm Đồng, Tây Ninh và Campuchia, đồng thời là cực tăng trưởng phía Đông của vùng Đông Nam Bộ.'
    ],
    products: ['Công nghiệp chế biến', 'Logistics', 'Cao su', 'Điều', 'Trái cây', 'Du lịch sinh thái', 'Sản phẩm OCOP'],
    stats: {
      total: 95,
      wards: 23,
      communes: 72,
      special: 0,
      source: 'Dữ liệu xã/phường hiện dùng trong ứng dụng: 95 đơn vị cấp xã, gồm 72 xã và 23 phường.'
    },
    images: [],
    sources: [
      {
        label: 'Cổng Thông tin điện tử Chính phủ: Nghị quyết số 30/2026/QH16 thành lập thành phố Đồng Nai',
        url: 'https://xaydungchinhsach.chinhphu.vn/nghi-quyet-so-30-2026-qh16-thanh-lap-thanh-pho-dong-nai-119260430102336551.htm'
      },
      {
        label: 'Cổng thông tin Đồng Nai: chính thức thành lập Thành phố Đồng Nai trực thuộc Trung ương từ 30-4-2026',
        url: 'https://talai.dongnai.gov.vn/vi/news/hoat-dong-chinh-quyen-nha-nuoc/chinh-thuc-thanh-lap-thanh-pho-dong-nai-truc-thuoc-trung-uong-tu-30-4-2026-489.html'
      }
    ]
  }
};

const provinceProducts = {
  '01': ['Du lịch di sản', 'Ẩm thực Hà Nội', 'Làng nghề', 'Dịch vụ đô thị'],
  '04': ['Hạt dẻ Trùng Khánh', 'Miến dong', 'Du lịch thác Bản Giốc', 'Sản phẩm OCOP'],
  '08': ['Chè', 'Cam sành', 'Gỗ rừng trồng', 'Du lịch sinh thái'],
  '11': ['Hồi', 'Na Chi Lăng', 'Du lịch cửa khẩu', 'Sản phẩm OCOP'],
  '12': ['Chè Thái Nguyên', 'Cơ khí - công nghiệp', 'Du lịch hồ Núi Cốc', 'Sản phẩm OCOP'],
  '14': ['Than - khoáng sản', 'Du lịch Hạ Long', 'Hải sản', 'Dịch vụ cảng biển'],
  '19': ['Quan họ', 'Công nghiệp điện tử', 'Làng nghề', 'Nông sản vùng Kinh Bắc'],
  '20': ['Cảng biển', 'Logistics', 'Du lịch Cát Bà', 'Hải sản'],
  '22': ['Nhãn lồng', 'Làng nghề', 'Nông nghiệp đồng bằng', 'Sản phẩm OCOP'],
  '24': ['Du lịch Tràng An', 'Dê núi', 'Cơ khí ô tô', 'Nông sản đồng bằng'],
  '25': ['Chè', 'Bưởi Đoan Hùng', 'Du lịch cội nguồn', 'Công nghiệp chế biến'],
  '26': ['Du lịch Sa Pa', 'Dược liệu', 'Quế', 'Nông sản vùng cao'],
  '30': ['Gạo Điện Biên', 'Cà phê', 'Du lịch lịch sử', 'Sản phẩm vùng cao'],
  '31': ['Chè', 'Mắc ca', 'Dược liệu', 'Du lịch cộng đồng'],
  '33': ['Chè', 'Sữa Mộc Châu', 'Mận hậu', 'Du lịch cao nguyên'],
  '36': ['Du lịch Sầm Sơn', 'Nông sản', 'Công nghiệp lọc hóa dầu', 'Hải sản'],
  '38': ['Cam Vinh', 'Du lịch Cửa Lò', 'Nông lâm sản', 'Công nghiệp chế biến'],
  '40': ['Bưởi Phúc Trạch', 'Nhung hươu', 'Du lịch biển', 'Công nghiệp cảng biển'],
  '42': ['Du lịch hang động', 'Hồ tiêu', 'Cao su', 'Di sản lịch sử'],
  '44': ['Di sản Huế', 'Ẩm thực Huế', 'Du lịch văn hóa', 'Thủ công mỹ nghệ'],
  '46': ['Du lịch biển', 'Công nghệ thông tin', 'Logistics', 'Sâm Ngọc Linh'],
  '48': ['Tỏi Lý Sơn', 'Quế Trà Bồng', 'Công nghiệp lọc dầu', 'Du lịch biển đảo'],
  '51': ['Cà phê', 'Hồ tiêu', 'Cao su', 'Du lịch văn hóa cồng chiêng'],
  '56': ['Du lịch biển Nha Trang', 'Yến sào', 'Nho - táo', 'Hải sản'],
  '66': ['Cà phê Buôn Ma Thuột', 'Sầu riêng', 'Hồ tiêu', 'Du lịch Tây Nguyên'],
  '68': ['Cà phê', 'Chè', 'Rau và hoa Đà Lạt', 'Dược liệu', 'Trái cây ôn đới', 'Mật ong', 'Sản phẩm OCOP'],
  '75': ['Công nghiệp chế biến', 'Logistics', 'Cao su', 'Điều', 'Trái cây', 'Du lịch sinh thái', 'Sản phẩm OCOP'],
  '79': ['Dịch vụ - tài chính', 'Công nghiệp công nghệ cao', 'Du lịch đô thị', 'Cảng biển'],
  '80': ['Muối tôm', 'Mãng cầu', 'Cao su', 'Du lịch núi Bà Đen'],
  '82': ['Xoài Cao Lãnh', 'Hoa Sa Đéc', 'Lúa gạo', 'Du lịch sinh thái'],
  '86': ['Dừa', 'Trái cây miệt vườn', 'Lúa gạo', 'Du lịch sông nước'],
  '91': ['Lúa gạo', 'Cá tra', 'Du lịch tâm linh', 'Hải sản Phú Quốc'],
  '92': ['Lúa gạo', 'Trái cây', 'Du lịch sông nước', 'Logistics ĐBSCL'],
  '96': ['Tôm', 'Cua Cà Mau', 'Rừng ngập mặn', 'Du lịch Đất Mũi'],
};

const provinceImageThemes = {
  '01': [['Hồ Gươm', 'Không gian di sản Thủ đô', 'city'], ['Văn Miếu', 'Giáo dục và lịch sử Hà Nội', 'heritage'], ['Làng nghề', 'Tinh hoa thủ công đồng bằng', 'craft']],
  '04': [['Thác Bản Giốc', 'Cảnh quan non nước Cao Bằng', 'mountain'], ['Hạt dẻ Trùng Khánh', 'Sản vật vùng cao', 'field'], ['Công viên địa chất', 'Núi đá và bản làng biên cương', 'mountain']],
  '08': [['Tân Trào', 'Dấu ấn lịch sử Tuyên Quang', 'heritage'], ['Cam sành', 'Nông sản đặc trưng', 'field'], ['Hồ Na Hang', 'Du lịch sinh thái miền núi', 'water']],
  '11': [['Ải Chi Lăng', 'Dấu ấn lịch sử Lạng Sơn', 'heritage'], ['Na Chi Lăng', 'Sản vật địa phương', 'field'], ['Cửa khẩu Hữu Nghị', 'Kinh tế biên mậu', 'city']],
  '12': [['Đồi chè', 'Không gian chè Thái Nguyên', 'field'], ['Hồ Núi Cốc', 'Du lịch sinh thái', 'water'], ['Công nghiệp', 'Trung tâm công nghiệp trung du', 'city']],
  '14': [['Vịnh Hạ Long', 'Di sản thiên nhiên Quảng Ninh', 'sea'], ['Than - khoáng sản', 'Không gian công nghiệp mỏ', 'industry'], ['Cảng biển', 'Logistics và du lịch biển', 'sea']],
  '19': [['Dân ca Quan họ', 'Bản sắc Kinh Bắc', 'heritage'], ['Làng nghề', 'Thủ công truyền thống', 'craft'], ['Công nghiệp điện tử', 'Trung tâm sản xuất hiện đại', 'industry']],
  '20': [['Cảng Hải Phòng', 'Đô thị cảng biển', 'sea'], ['Cát Bà', 'Du lịch biển đảo', 'island'], ['Logistics', 'Cửa ngõ giao thương phía Bắc', 'industry']],
  '22': [['Nhãn lồng', 'Sản vật Hưng Yên', 'field'], ['Phố Hiến', 'Di sản thương cảng xưa', 'heritage'], ['Làng nghề', 'Nông nghiệp và thủ công đồng bằng', 'craft']],
  '24': [['Tràng An', 'Di sản danh thắng Ninh Bình', 'heritage'], ['Dê núi', 'Ẩm thực địa phương', 'field'], ['Cơ khí ô tô', 'Công nghiệp trọng điểm', 'industry']],
  '25': [['Đền Hùng', 'Vùng đất cội nguồn Phú Thọ', 'heritage'], ['Bưởi Đoan Hùng', 'Sản vật trung du', 'field'], ['Chè Phú Thọ', 'Nông sản vùng đồi', 'field']],
  '26': [['Sa Pa', 'Ruộng bậc thang và núi Fansipan', 'mountain'], ['Quế Lào Cai', 'Nông lâm sản vùng cao', 'forest'], ['Cửa khẩu', 'Giao thương biên giới', 'city']],
  '30': [['Mường Thanh', 'Cánh đồng lịch sử Điện Biên', 'field'], ['Đồi A1', 'Di tích chiến thắng Điện Biên Phủ', 'heritage'], ['Gạo Điện Biên', 'Sản phẩm nông nghiệp vùng cao', 'field']],
  '31': [['Đèo Ô Quy Hồ', 'Cảnh quan núi rừng Lai Châu', 'mountain'], ['Dược liệu', 'Sản phẩm vùng cao', 'field'], ['Bản làng', 'Văn hóa các dân tộc Tây Bắc', 'heritage']],
  '33': [['Cao nguyên Mộc Châu', 'Du lịch cao nguyên Sơn La', 'mountain'], ['Sữa Mộc Châu', 'Nông nghiệp đặc trưng', 'field'], ['Mận hậu', 'Trái cây vùng cao', 'field']],
  '36': [['Sầm Sơn', 'Du lịch biển Thanh Hóa', 'sea'], ['Lam Kinh', 'Di tích lịch sử xứ Thanh', 'heritage'], ['Nghi Sơn', 'Công nghiệp ven biển', 'industry']],
  '38': [['Cửa Lò', 'Biển Nghệ An', 'sea'], ['Làng Sen', 'Không gian văn hóa lịch sử', 'heritage'], ['Cam Vinh', 'Sản phẩm nông nghiệp', 'field']],
  '40': [['Bưởi Phúc Trạch', 'Sản vật Hà Tĩnh', 'field'], ['Biển Thiên Cầm', 'Du lịch biển', 'sea'], ['Cảng Vũng Áng', 'Kinh tế cảng biển', 'industry']],
  '42': [['Thành cổ Quảng Trị', 'Di tích lịch sử', 'heritage'], ['Động Phong Nha', 'Di sản hang động', 'mountain'], ['Hồ tiêu', 'Nông sản đặc trưng', 'field']],
  '44': [['Kinh thành Huế', 'Di sản cố đô', 'heritage'], ['Sông Hương', 'Không gian văn hóa Huế', 'water'], ['Ẩm thực Huế', 'Sản phẩm văn hóa địa phương', 'craft']],
  '46': [['Sông Hàn', 'Đô thị biển Đà Nẵng', 'city'], ['Hội An', 'Di sản văn hóa', 'heritage'], ['Sâm Ngọc Linh', 'Sản vật miền núi', 'forest']],
  '48': [['Tỏi Lý Sơn', 'Sản vật đảo Quảng Ngãi', 'island'], ['Quế Trà Bồng', 'Nông lâm sản đặc trưng', 'forest'], ['Dung Quất', 'Công nghiệp ven biển', 'industry']],
  '51': [['Biển Quy Nhơn', 'Không gian duyên hải Gia Lai mới', 'sea'], ['Cồng chiêng', 'Văn hóa Tây Nguyên', 'heritage'], ['Cà phê - hồ tiêu', 'Cây công nghiệp chủ lực', 'field']],
  '56': [['Vịnh Nha Trang', 'Du lịch biển Khánh Hòa', 'sea'], ['Yến sào', 'Sản phẩm đặc trưng', 'island'], ['Tháp Chăm', 'Dấu ấn văn hóa miền Trung', 'heritage']],
  '66': [['Cà phê Buôn Ma Thuột', 'Thủ phủ cà phê', 'field'], ['Cồng chiêng', 'Văn hóa Tây Nguyên', 'heritage'], ['Sầu riêng', 'Nông sản giá trị cao', 'field']],
  '68': [['Đà Lạt', 'Trung tâm du lịch cao nguyên', 'mountain'], ['Rau và hoa', 'Nông nghiệp công nghệ cao', 'field'], ['Chè - cà phê', 'Sản phẩm cao nguyên', 'field']],
  '75': [['Hồ Trị An', 'Không gian sinh thái Đồng Nai', 'water'], ['Cát Tiên', 'Vườn quốc gia và đa dạng sinh học', 'forest'], ['Công nghiệp - logistics', 'Động lực Đông Nam Bộ', 'industry']],
  '79': [['Bến Nhà Rồng', 'Dấu ấn lịch sử thành phố', 'heritage'], ['Đô thị hiện đại', 'Trung tâm kinh tế lớn nhất cả nước', 'city'], ['Cảng biển', 'Logistics và dịch vụ', 'industry']],
  '80': [['Núi Bà Đen', 'Biểu tượng Tây Ninh', 'mountain'], ['Muối tôm', 'Sản phẩm địa phương', 'field'], ['Cao su', 'Cây công nghiệp Đông Nam Bộ', 'field']],
  '82': [['Hoa Sa Đéc', 'Làng hoa Đồng Tháp', 'field'], ['Xoài Cao Lãnh', 'Sản vật miệt vườn', 'field'], ['Tràm Chim', 'Du lịch sinh thái ngập nước', 'water']],
  '86': [['Dừa', 'Sản vật Vĩnh Long mới', 'field'], ['Sông nước miệt vườn', 'Không gian Đồng bằng sông Cửu Long', 'water'], ['Lúa gạo', 'Nông nghiệp phù sa', 'field']],
  '91': [['Châu Đốc', 'Du lịch tâm linh An Giang', 'heritage'], ['Cá tra', 'Thủy sản sông nước', 'water'], ['Phú Quốc', 'Du lịch biển đảo', 'island']],
  '92': [['Bến Ninh Kiều', 'Đô thị sông nước Cần Thơ', 'water'], ['Chợ nổi', 'Văn hóa thương hồ', 'water'], ['Lúa gạo - trái cây', 'Trung tâm nông sản ĐBSCL', 'field']],
  '96': [['Đất Mũi', 'Cực Nam Tổ quốc', 'water'], ['Rừng ngập mặn', 'Sinh thái Cà Mau', 'forest'], ['Tôm - cua', 'Sản phẩm kinh tế biển', 'sea']],
};

const regionProfiles = {
  'Đồng bằng sông Hồng': {
    economy: ['Công nghiệp, dịch vụ đô thị, thương mại và logistics phát triển mạnh.', 'Nông nghiệp đồng bằng, làng nghề và kinh tế tri thức giữ vai trò bổ trợ quan trọng.'],
    culture: ['Không gian văn hóa Bắc Bộ, di tích lịch sử, lễ hội truyền thống và làng nghề tạo bản sắc nổi bật.'],
    society: ['Mật độ dân cư cao, hệ thống giáo dục - y tế - hạ tầng xã hội phát triển, nhu cầu quản trị đô thị và dịch vụ công lớn.'],
  },
  'Trung du và miền núi phía Bắc': {
    economy: ['Kinh tế dựa trên nông lâm nghiệp, khoáng sản, thủy điện, kinh tế cửa khẩu và du lịch sinh thái.', 'Các sản phẩm vùng cao, dược liệu, chè, cây ăn quả và chăn nuôi có tiềm năng nâng giá trị.'],
    culture: ['Bản sắc các dân tộc miền núi, chợ phiên, lễ hội, văn hóa cộng đồng và cảnh quan núi rừng là tài nguyên văn hóa - du lịch quan trọng.'],
    society: ['Địa bàn rộng, phân bố dân cư không đều; ưu tiên hạ tầng giao thông, giáo dục, y tế cơ sở và giảm nghèo bền vững.'],
  },
  'Bắc Trung Bộ và Duyên hải miền Trung': {
    economy: ['Kinh tế biển, du lịch, công nghiệp ven biển, nông lâm nghiệp và logistics là các hướng phát triển chính.', 'Các địa phương có lợi thế về cảng biển, năng lượng, thủy sản, du lịch di sản và du lịch nghỉ dưỡng.'],
    culture: ['Không gian văn hóa miền Trung kết hợp di sản, lễ hội, làng nghề, văn hóa biển và truyền thống lịch sử.'],
    society: ['Địa bàn chịu tác động thiên tai, cần chú trọng thích ứng khí hậu, sinh kế ven biển và kết nối hạ tầng vùng.'],
  },
  'Tây Nguyên': {
    economy: ['Nông nghiệp hàng hóa, cây công nghiệp, năng lượng tái tạo, kinh tế rừng và du lịch sinh thái là thế mạnh.', 'Cà phê, hồ tiêu, cao su, trái cây, dược liệu và sản phẩm OCOP có vai trò nổi bật.'],
    culture: ['Không gian văn hóa cồng chiêng, văn hóa cộng đồng các dân tộc Tây Nguyên và lễ hội truyền thống tạo bản sắc riêng.'],
    society: ['Ưu tiên phát triển hạ tầng, bảo vệ rừng, quản lý tài nguyên nước, nâng cao sinh kế và dịch vụ xã hội vùng đồng bào dân tộc.'],
  },
  'Đông Nam Bộ': {
    economy: ['Công nghiệp chế biến, dịch vụ, logistics, đô thị hóa và kinh tế cảng biển là động lực chính.', 'Vùng có khả năng thu hút đầu tư, phát triển công nghiệp công nghệ cao và chuỗi cung ứng lớn.'],
    culture: ['Văn hóa đô thị Nam Bộ, di tích cách mạng, không gian công nghiệp - dịch vụ và giao thoa dân cư tạo nét đa dạng.'],
    society: ['Dân cư cơ học tăng nhanh, nhu cầu nhà ở, giao thông, giáo dục, y tế và dịch vụ công đô thị rất lớn.'],
  },
  'Đồng bằng sông Cửu Long': {
    economy: ['Lúa gạo, thủy sản, trái cây, kinh tế sông nước, năng lượng và logistics nông sản là trụ cột.', 'Chế biến nông thủy sản, du lịch sinh thái và kinh tế biển có vai trò ngày càng quan trọng.'],
    culture: ['Văn hóa miệt vườn, chợ nổi, đờn ca tài tử, lễ hội dân gian và cộng đồng đa dân tộc tạo sức hút đặc trưng.'],
    society: ['Ưu tiên thích ứng biến đổi khí hậu, quản lý nước, chống sạt lở, nâng cao sinh kế và hạ tầng vùng sông nước.'],
  },
};

const supplementalMergeRows = [
  {
    province_code: '68',
    province_name: 'Lâm Đồng',
    new_code: '25051',
    new_name: 'Xã Sơn Điền',
    old_name: 'Xã Gia Bắc; Xã Sơn Điền',
    old_district: 'Huyện Di Linh',
    area_km2: 261.88,
    population: 7310,
    office: 'UBND xã Gia Bắc (cũ)',
    source_name: 'Nghị quyết 1671/NQ-UBTVQH15; Thư viện Pháp luật',
    source_url: 'https://thuvienphapluat.vn/phap-luat/xa-son-dien-moi-tinh-lam-dong-sap-nhap-tu-nhung-xa-phuong-thi-tran-nao-sau-sap-xep-don-vi-hanh-chin-491683-263221.html'
  },
  {
    province_code: '68',
    province_name: 'Lâm Đồng',
    new_code: '',
    new_name: 'Xã Lạc Dương',
    old_name: 'Xã Đạ Sar; Xã Đạ Nhim; Xã Đạ Chais',
    source_name: 'Thư viện Pháp luật',
    source_url: 'https://news.thuvienphapluat.vn/tintuc/vn/ho-tro-phap-luat/thong-tin-huu-ich/90839/ban-do-lam-dong-moi-nhat-chi-tiet-124-don-vi-cap-xa-sau-sap-nhap-cua-tinh-lam-dong'
  },
  {
    province_code: '68',
    province_name: 'Lâm Đồng',
    new_code: '',
    new_name: 'Xã Đơn Dương',
    old_name: 'Thị trấn Thạnh Mỹ; Xã Đạ Ròn; Xã Tu Tra',
    source_name: 'Thư viện Pháp luật',
    source_url: 'https://news.thuvienphapluat.vn/tintuc/vn/ho-tro-phap-luat/thong-tin-huu-ich/90839/ban-do-lam-dong-moi-nhat-chi-tiet-124-don-vi-cap-xa-sau-sap-nhap-cua-tinh-lam-dong'
  },
  {
    province_code: '68',
    province_name: 'Lâm Đồng',
    new_code: '',
    new_name: 'Xã Ka Đô',
    old_name: 'Xã Lạc Lâm; Xã Ka Đô',
    source_name: 'Thư viện Pháp luật',
    source_url: 'https://news.thuvienphapluat.vn/tintuc/vn/ho-tro-phap-luat/thong-tin-huu-ich/90839/ban-do-lam-dong-moi-nhat-chi-tiet-124-don-vi-cap-xa-sau-sap-nhap-cua-tinh-lam-dong'
  },
  {
    province_code: '68',
    province_name: 'Lâm Đồng',
    new_code: '',
    new_name: 'Xã Quảng Lập',
    old_name: 'Xã Ka Đơn; Xã Quảng Lập',
    source_name: 'Thư viện Pháp luật',
    source_url: 'https://news.thuvienphapluat.vn/tintuc/vn/ho-tro-phap-luat/thong-tin-huu-ich/90839/ban-do-lam-dong-moi-nhat-chi-tiet-124-don-vi-cap-xa-sau-sap-nhap-cua-tinh-lam-dong'
  },
  {
    province_code: '68',
    province_name: 'Lâm Đồng',
    new_code: '',
    new_name: "Xã D'Ran",
    old_name: "Thị trấn D'Ran; Xã Lạc Xuân",
    source_name: 'Thư viện Pháp luật',
    source_url: 'https://news.thuvienphapluat.vn/tintuc/vn/ho-tro-phap-luat/thong-tin-huu-ich/90839/ban-do-lam-dong-moi-nhat-chi-tiet-124-don-vi-cap-xa-sau-sap-nhap-cua-tinh-lam-dong'
  },
  {
    province_code: '68',
    province_name: 'Lâm Đồng',
    new_code: '',
    new_name: 'Xã Hiệp Thạnh',
    old_name: 'Xã Hiệp An; Xã Liên Hiệp; Xã Hiệp Thạnh',
    source_name: 'Thư viện Pháp luật',
    source_url: 'https://news.thuvienphapluat.vn/tintuc/vn/ho-tro-phap-luat/thong-tin-huu-ich/90839/ban-do-lam-dong-moi-nhat-chi-tiet-124-don-vi-cap-xa-sau-sap-nhap-cua-tinh-lam-dong'
  },
  {
    province_code: '68',
    province_name: 'Lâm Đồng',
    new_code: '',
    new_name: 'Xã Đức Trọng',
    old_name: 'Thị trấn Liên Nghĩa; Xã Phú Hội',
    source_name: 'Thư viện Pháp luật',
    source_url: 'https://news.thuvienphapluat.vn/tintuc/vn/ho-tro-phap-luat/thong-tin-huu-ich/90839/ban-do-lam-dong-moi-nhat-chi-tiet-124-don-vi-cap-xa-sau-sap-nhap-cua-tinh-lam-dong'
  },
  {
    province_code: '68',
    province_name: 'Lâm Đồng',
    new_code: '',
    new_name: 'Xã Tân Hội',
    old_name: "Xã Tân Thành (Đức Trọng); Xã N'Thôn Hạ; Xã Tân Hội",
    source_name: 'Thư viện Pháp luật',
    source_url: 'https://news.thuvienphapluat.vn/tintuc/vn/ho-tro-phap-luat/thong-tin-huu-ich/90839/ban-do-lam-dong-moi-nhat-chi-tiet-124-don-vi-cap-xa-sau-sap-nhap-cua-tinh-lam-dong'
  }
];

const lamDongOfficialMergeRows = [
  ['Xã Đạ Sar; Xã Đạ Nhim; Xã Đạ Chais', 'Xã Lạc Dương'],
  ['Thị trấn Thạnh Mỹ; Xã Đạ Ròn; Xã Tu Tra', 'Xã Đơn Dương'],
  ['Xã Lạc Lâm; Xã Ka Đô', 'Xã Ka Đô'],
  ['Xã Ka Đơn; Xã Quảng Lập', 'Xã Quảng Lập'],
  ["Thị trấn D'Ran; Xã Lạc Xuân", "Xã D'Ran"],
  ['Xã Hiệp An; Xã Liên Hiệp; Xã Hiệp Thạnh', 'Xã Hiệp Thạnh'],
  ['Thị trấn Liên Nghĩa; Xã Phú Hội', 'Xã Đức Trọng'],
  ["Xã Tân Thành (Đức Trọng); Xã N'Thôn Hạ; Xã Tân Hội", 'Xã Tân Hội'],
  ['Xã Ninh Loan; Xã Đà Loan; Xã Tà Hine', 'Xã Tà Hine'],
  ['Xã Đa Quyn; Xã Tà Năng', 'Xã Tà Năng'],
  ['Xã Bình Thạnh (Đức Trọng); Xã Tân Văn; Thị trấn Đinh Văn', 'Xã Đinh Văn Lâm Hà'],
  ['Xã Phú Sơn; Xã Đạ Đờn', 'Xã Phú Sơn Lâm Hà'],
  ['Xã Nam Hà; Xã Phi Tô', 'Xã Nam Hà Lâm Hà'],
  ['Thị trấn Nam Ban; Xã Đông Thanh; Xã Mê Linh; Xã Gia Lâm', 'Xã Nam Ban Lâm Hà'],
  ['Xã Tân Hà (Lâm Hà); Xã Hoài Đức; Xã Đan Phượng; Xã Liên Hà', 'Xã Tân Hà Lâm Hà'],
  ['Xã Phúc Thọ; Xã Tân Thanh', 'Xã Phúc Thọ Lâm Hà'],
  ["Xã Phi Liêng; Xã Đạ K'Nàng", 'Xã Đam Rông 1'],
  ['Xã Rô Men; Xã Liêng Srônh', 'Xã Đam Rông 2'],
  ["Xã Đạ Rsal; Xã Đạ M'Rông", 'Xã Đam Rông 3'],
  ["Xã Đạ Tông; Xã Đạ Long; Xã Đưng K'Nớ", 'Xã Đam Rông 4'],
  ['Thị trấn Di Linh; Xã Liên Đầm; Xã Tân Châu; Xã Gung Ré', 'Xã Di Linh'],
  ['Xã Đinh Trang Hòa; Xã Hòa Trung; Xã Hòa Ninh', 'Xã Hòa Ninh'],
  ['Xã Hòa Nam; Xã Hòa Bắc', 'Xã Hòa Bắc'],
  ['Xã Tân Lâm; Xã Tân Thượng; Xã Đinh Trang Thượng', 'Xã Đinh Trang Thượng'],
  ['Xã Đinh Lạc; Xã Tân Nghĩa; Xã Bảo Thuận', 'Xã Bảo Thuận'],
  ['Xã Gia Bắc; Xã Sơn Điền', 'Xã Sơn Điền', '25051'],
  ['Xã Tam Bố; Xã Gia Hiệp', 'Xã Gia Hiệp'],
  ['Thị trấn Lộc Thắng; Xã Lộc Quảng; Xã Lộc Ngãi', 'Xã Bảo Lâm 1'],
  ['Xã Lộc An; Xã Lộc Đức; Xã Tân Lạc', 'Xã Bảo Lâm 2'],
  ['Xã Lộc Thành; Xã Lộc Nam', 'Xã Bảo Lâm 3'],
  ["Xã Lộc Phú; Xã Lộc Lâm; Xã B'Lá", 'Xã Bảo Lâm 4'],
  ['Xã Lộc Bảo; Xã Lộc Bắc', 'Xã Bảo Lâm 5'],
  ['Thị trấn Mađaguôi; Xã Mađaguôi; Xã Đạ Oai', 'Xã Đạ Huoai'],
  ["Thị trấn Đạ M'ri; Xã Hà Lâm", 'Xã Đạ Huoai 2'],
  ['Thị trấn Đạ Tẻh; Xã An Nhơn; Xã Đạ Lây', 'Xã Đạ Tẻh'],
  ['Xã Quảng Trị; Xã Đạ Pal; Xã Đạ Kho', 'Xã Đạ Tẻh 2'],
  ['Xã Mỹ Đức; Xã Quốc Oai', 'Xã Đạ Tẻh 3'],
  ['Thị trấn Cát Tiên; Xã Nam Ninh; Xã Quảng Ngãi', 'Xã Cát Tiên'],
  ['Thị trấn Phước Cát; Xã Phước Cát 2; Xã Đức Phổ', 'Xã Cát Tiên 2'],
  ['Xã Gia Viễn; Xã Tiên Hoàng; Xã Đồng Nai Thượng', 'Xã Cát Tiên 3'],
  ['Xã Vĩnh Tân; Xã Vĩnh Hảo', 'Xã Vĩnh Hảo'],
  ['Thị trấn Liên Hương; Xã Bình Thạnh (Tuy Phong); Xã Phước Thể; Xã Phú Lạc', 'Xã Liên Hương'],
  ['Xã Phan Dũng; Một phần xã Phong Phú', 'Xã Tuy Phong'],
  ['Thị trấn Phan Rí Cửa; Xã Chí Công; Xã Hòa Minh; Phần còn lại của xã Phong Phú', 'Xã Phan Rí Cửa'],
  ['Thị trấn Chợ Lầu; Xã Phan Hòa; Xã Phan Hiệp; Xã Phan Rí Thành', 'Xã Bắc Bình'],
  ['Xã Phan Thanh; Xã Hồng Thái; Một phần xã Hòa Thắng', 'Xã Hồng Thái'],
  ['Xã Bình An; Xã Phan Điền; Xã Hải Ninh', 'Xã Hải Ninh'],
  ['Xã Phan Lâm; Xã Phan Sơn', 'Xã Phan Sơn'],
  ['Xã Phan Tiến; Xã Bình Tân; Xã Sông Lũy', 'Xã Sông Lũy'],
  ['Thị trấn Lương Sơn; Xã Sông Bình', 'Xã Lương Sơn'],
  ['Xã Hồng Phong; Phần còn lại của xã Hòa Thắng', 'Xã Hòa Thắng'],
  ['Xã Đông Tiến; Xã Đông Giang', 'Xã Đông Giang'],
  ['Xã Đa Mi; Xã La Dạ', 'Xã La Dạ'],
  ['Xã Thuận Hòa; Xã Hàm Trí; Xã Hàm Phú', 'Xã Hàm Thuận Bắc'],
  ['Thị trấn Ma Lâm; Xã Thuận Minh; Xã Hàm Đức', 'Xã Hàm Thuận'],
  ['Xã Hồng Liêm; Xã Hồng Sơn', 'Xã Hồng Sơn'],
  ['Xã Hàm Chính; Xã Hàm Liêm', 'Xã Hàm Liêm'],
  ['Xã Tiến Lợi; Xã Hàm Mỹ', 'Xã Tuyên Quang'],
  ['Xã Mỹ Thạnh; Xã Hàm Cần; Xã Hàm Thạnh', 'Xã Hàm Thạnh'],
  ['Xã Mương Mán; Xã Hàm Cường; Xã Hàm Kiệm', 'Xã Hàm Kiệm'],
  ['Xã Tân Thành (Hàm Thuận Nam); Xã Thuận Quý; Xã Tân Thuận', 'Xã Tân Thành'],
  ['Thị trấn Thuận Nam; Xã Hàm Minh', 'Xã Hàm Thuận Nam'],
  ['Xã Sông Phan; Xã Tân Lập', 'Xã Tân Lập'],
  ['Thị trấn Tân Minh; Xã Tân Đức; Xã Tân Phúc', 'Xã Tân Minh'],
  ['Xã Tân Hà (Hàm Tân); Xã Tân Xuân; Thị trấn Tân Nghĩa', 'Xã Hàm Tân'],
  ['Xã Tân Thắng; Xã Thắng Hải; Xã Sơn Mỹ', 'Xã Sơn Mỹ'],
  ['Xã Tân Tiến; Xã Tân Hải', 'Xã Tân Hải'],
  ['Xã Đức Phú; Xã Nghị Đức', 'Xã Nghị Đức'],
  ['Xã Măng Tố; Xã Bắc Ruộng', 'Xã Bắc Ruộng'],
  ['Xã Huy Khiêm; Xã La Ngâu; Xã Đức Bình; Xã Đồng Kho', 'Xã Đồng Kho'],
  ['Thị trấn Lạc Tánh; Xã Gia An; Xã Đức Thuận', 'Xã Tánh Linh'],
  ['Xã Gia Huynh; Xã Suối Kiết', 'Xã Suối Kiết'],
  ['Xã Mê Pu; Xã Sùng Nhơn; Xã Đa Kai', 'Xã Nam Thành'],
  ['Thị trấn Võ Xu; Xã Nam Chính; Xã Vũ Hòa', 'Xã Đức Linh'],
  ['Thị trấn Đức Tài; Xã Đức Tín; Xã Đức Hạnh', 'Xã Hoài Đức'],
  ['Xã Tân Hà (Đức Linh); Xã Đông Hà; Xã Trà Tân', 'Xã Trà Tân'],
  ['Xã Ea Pô; Xã Đắk Wil', 'Xã Đắk Wil'],
  ["Xã Đắk D'rông; Xã Nam Dong", 'Xã Nam Dong'],
  ["Thị trấn Ea T'ling; Xã Trúc Sơn; Xã Tâm Thắng; Xã Cư K'nia", 'Xã Cư Jút'],
  ['Xã Đắk Lao; Xã Thuận An', 'Xã Thuận An'],
  ['Thị trấn Đắk Mil; Xã Đức Mạnh; Xã Đức Minh', 'Xã Đức Lập'],
  ["Xã Đắk Gằn; Xã Đắk N'Drót; Xã Đắk R'La", 'Xã Đắk Mil'],
  ['Xã Nam Xuân; Xã Long Sơn; Xã Đắk Sắk', 'Xã Đắk Sắk'],
  ['Xã Buôn Choáh; Xã Đắk Sôr; Xã Nam Đà', 'Xã Nam Đà'],
  ['Xã Tân Thành (Krông Nô); Xã Đắk Drô; Thị trấn Đắk Mâm', 'Xã Krông Nô'],
  ["Xã Nâm N'Đir; Xã Nâm Nung", 'Xã Nâm Nung'],
  ['Xã Đức Xuyên; Xã Đắk Nang; Xã Quảng Phú', 'Xã Quảng Phú'],
  ['Xã Đắk Môl; Xã Đắk Hòa', 'Xã Đắk Song'],
  ["Thị trấn Đức An; Xã Đắk N'Drung; Xã Nam Bình", 'Xã Đức An'],
  ['Xã Thuận Hà; Xã Thuận Hạnh', 'Xã Thuận Hạnh'],
  ["Xã Nâm N'Jang; Xã Trường Xuân", 'Xã Trường Xuân'],
  ["Xã Đắk Som; Xã Đắk R'Măng", 'Xã Tà Đùng'],
  ['Xã Đắk Plao; Xã Quảng Khê', 'Xã Quảng Khê'],
  ['Xã Đắk Ngo; Xã Quảng Tân', 'Xã Quảng Tân'],
  ["Xã Quảng Tâm; Xã Đắk R'Tíh; Xã Đắk Búk So", 'Xã Tuy Đức'],
  ['Thị trấn Kiến Đức; Xã Đạo Nghĩa; Xã Nghĩa Thắng; Xã Kiến Thành', 'Xã Kiến Đức'],
  ['Xã Nhân Đạo; Xã Đắk Wer; Xã Nhân Cơ', 'Xã Nhân Cơ'],
  ['Xã Đắk Sin; Xã Hưng Bình; Xã Đắk Ru; Xã Quảng Tín', 'Xã Quảng Tín'],
  ['Phường 1; Phường 2; Phường 3; Phường 4; Phường 10 (Đà Lạt)', 'Phường Xuân Hương - Đà Lạt'],
  ['Phường 5; Phường 6; Xã Tà Nung', 'Phường Cam Ly - Đà Lạt'],
  ['Phường 8; Phường 9; Phường 12', 'Phường Lâm Viên - Đà Lạt'],
  ['Phường 11; Xã Xuân Thọ; Xã Xuân Trường; Xã Trạm Hành', 'Phường Xuân Trường - Đà Lạt'],
  ['Phường 7; Thị trấn Lạc Dương; Xã Lát', 'Phường Lang Biang - Đà Lạt'],
  ['Phường 1 (Bảo Lộc); Phường Lộc Phát; Xã Lộc Thanh', 'Phường 1 Bảo Lộc'],
  ['Phường 2 (Bảo Lộc); Xã Lộc Tân; Xã ĐamBri', 'Phường 2 Bảo Lộc'],
  ['Phường Lộc Tiến; Xã Lộc Châu; Xã Đại Lào', 'Phường 3 Bảo Lộc'],
  ["Phường Lộc Sơn; Phường B'Lao; Xã Lộc Nga", "Phường B'Lao"],
  ['Phường Xuân An; Thị trấn Phú Long; Xã Hàm Thắng', 'Phường Hàm Thắng'],
  ['Phường Phú Tài; Xã Phong Nẫm; Xã Hàm Hiệp', 'Phường Bình Thuận'],
  ['Phường Hàm Tiến; Phường Mũi Né; Xã Thiện Nghiệp', 'Phường Mũi Né'],
  ['Phường Thanh Hải; Phường Phú Hài; Phường Phú Thủy', 'Phường Phú Thủy'],
  ['Phường Phú Trinh; Phường Lạc Đạo; Phường Bình Hưng', 'Phường Phan Thiết'],
  ['Phường Đức Long; Xã Tiến Thành', 'Phường Tiến Thành'],
  ['Phường Tân An; Phường Bình Tân; Phường Tân Thiện; Xã Tân Bình', 'Phường La Gi'],
  ['Phường Phước Lộc; Phường Phước Hội; Xã Tân Phước', 'Phường Phước Hội'],
  ['Phường Quảng Thành; Phường Nghĩa Thành; Phường Nghĩa Đức; Xã Đắk Ha', 'Phường Bắc Gia Nghĩa'],
  ["Phường Nghĩa Phú; Phường Nghĩa Tân; Xã Đắk R'Moan", 'Phường Nam Gia Nghĩa'],
  ['Phường Nghĩa Trung; Xã Đắk Nia', 'Phường Đông Gia Nghĩa'],
  ['Xã Long Hải; Xã Ngũ Phụng; Xã Tam Thanh', 'Đặc khu Phú Quý'],
  ['Xã Bà Gia', 'Xã Đạ Huoai 3'],
  ['Xã Quảng Hòa', 'Xã Quảng Hòa'],
  ['Xã Quảng Sơn', 'Xã Quảng Sơn'],
  ['Xã Quảng Trực', 'Xã Quảng Trực'],
  ['Xã Ninh Gia', 'Xã Ninh Gia'],
].map(([oldName, newName, code]) => ({
  province_code: '68',
  province_name: 'Lâm Đồng',
  new_code: code || '',
  new_name: newName,
  old_name: oldName,
  source_name: 'Cổng TTĐT Chính phủ - Nghị quyết 1671/NQ-UBTVQH15',
  source_url: 'https://xaydungchinhsach.chinhphu.vn/sap-xep-dvhc-danh-sach-124-xa-phuong-dac-khu-cua-tinh-lam-dong-moi-119250623065800248.htm',
}));

const sounds = {
  click: new Audio('/python/assets/click.wav'),
  select: new Audio('/python/assets/select.mp3'),
  correct: new Audio('/python/assets/correct.mp3'),
  win: new Audio('/python/assets/win.mp3'),
  lose: new Audio('/python/assets/lose.mp3'),
};

function playSound(name) {
  if (!state.soundOn || !sounds[name]) return;
  try {
    sounds[name].currentTime = 0;
    sounds[name].play().catch(() => {});
  } catch (_error) {
    // Browser audio policies can block playback before the first user action.
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function repairText(value) {
  const text = String(value ?? '');
  if (!/(?:\u00c3|\u00c2|\u00c4|\u00c5|\u00c6|\u00d0|\u0102|\u00e2\u20ac|\u00e1\u00ba|\u00e1\u00bb)/.test(text)) return text;
  try {
    const windows1252 = {
      '\u20ac': 0x80, '\u201a': 0x82, '\u0192': 0x83, '\u201e': 0x84,
      '\u2026': 0x85, '\u2020': 0x86, '\u2021': 0x87, '\u02c6': 0x88,
      '\u2030': 0x89, '\u0160': 0x8a, '\u2039': 0x8b, '\u0152': 0x8c,
      '\u017d': 0x8e, '\u2018': 0x91, '\u2019': 0x92, '\u201c': 0x93,
      '\u201d': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
      '\u02dc': 0x98, '\u2122': 0x99, '\u0161': 0x9a, '\u203a': 0x9b,
      '\u0153': 0x9c, '\u017e': 0x9e, '\u0178': 0x9f, '\u0102': 0xc3,
    };
    const bytes = [];
    for (const char of text) {
      const code = char.charCodeAt(0);
      if (code <= 0xff) bytes.push(code);
      else if (windows1252[char] !== undefined) bytes.push(windows1252[char]);
      else return text;
    }
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  } catch (_error) {
    return text;
  }
}

function repairStaticDomText(root = document.body) {
  document.title = repairText(document.title);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    node.nodeValue = repairText(node.nodeValue);
  });
  root.querySelectorAll('[placeholder], [title], [aria-label], [alt]').forEach(element => {
    ['placeholder', 'title', 'aria-label', 'alt'].forEach(attribute => {
      if (element.hasAttribute(attribute)) {
        element.setAttribute(attribute, repairText(element.getAttribute(attribute)));
      }
    });
  });
}

function repairList(values) {
  return Array.isArray(values) ? values.map(repairText) : [];
}

function repairProvince(province) {
  const repaired = {
    ...province,
    name: repairText(province.name),
    type: repairText(province.type),
    full_name: repairText(province.full_name),
    region: repairText(province.region),
    capital: repairText(province.capital),
    merged_from: repairList(province.merged_from),
  };
  if (String(repaired.code).padStart(2, '0') === '75') {
    return {
      ...repaired,
      code: '75',
      name: 'Đồng Nai',
      type: 'Thành Phố',
      full_name: 'Thành Phố Đồng Nai',
      region: 'Đông Nam Bộ',
      capital: 'Biên Hòa',
      merged: true,
      merged_from: ['Đồng Nai', 'Bình Phước'],
    };
  }
  return repaired;
}

function normalize(value) {
  return repairText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Ä‘/g, 'd')
    .trim();
}

function fullProvinceName(province) {
  if (!province) return '';
  if (String(province.code).padStart(2, '0') === '75') return 'Thành Phố Đồng Nai';
  return province.code === '01' ? repairText('Thá»§ Ä‘Ă´ HĂ  Ná»™i') : repairText(`${province.type} ${province.name}`);
}

function selectedProvince() {
  return state.provinces.find(item => item.code === state.selectedCode) || state.provinces[0];
}

function setMapDirectMode(enabled) {
  state.mapDirectMode = Boolean(enabled);
  $('workspace').classList.toggle('map-direct', state.mapDirectMode);
}

async function getJson(url, fallback) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    console.warn(`KhĂ´ng táº£i Ä‘Æ°á»£c ${url}`, error);
    return fallback;
  }
}

async function loadData() {
  const provinceData = await getJson('/api/provinces', { items: [] });
  state.provinces = (provinceData.items || []).map(repairProvince);
  state.quizQuestions = await getJson('/python/data/quiz_questions.json', []);
  state.quizQuestions = state.quizQuestions.map(question => ({
    ...question,
    question: repairText(question.question),
    choices: Object.fromEntries(Object.entries(question.choices || {}).map(([key, text]) => [key, repairText(text)])),
  }));
  state.mergeRows = await getJson('/data/old-to-new-full.json', []);
  state.communeRows = await getJson('/data/communes-full.json', []);
}

function renderProvinceList(items = state.provinces) {
  $('province-list').innerHTML = items.map(province => `
    <button class="province-item ${province.code === state.selectedCode ? 'active' : ''}" type="button" data-code="${province.code}">
      <span class="province-code">${escapeHtml(province.code)}</span>
      <span class="province-name">
        <strong>${escapeHtml(fullProvinceName(province))}</strong>
        <span>${escapeHtml(province.region)}</span>
      </span>
    </button>
  `).join('');

  document.querySelectorAll('.province-item').forEach(button => {
    button.addEventListener('click', () => {
      playSound('click');
      selectProvince(button.dataset.code);
    });
  });
}

function filterProvinceList() {
  const q = normalize($('province-search').value);
  const items = q
    ? state.provinces.filter(province => normalize([
      province.code,
      province.name,
      province.full_name,
      province.region,
      ...(province.merged_from || []),
    ].join(' ')).includes(q))
    : state.provinces;
  renderProvinceList(items);
}

function updateProvinceDetails() {
  const province = selectedProvince();
  if (!province) return;

  $('selected-title').textContent = fullProvinceName(province);
  $('province-region').textContent = province.region || 'Chưa rõ';
  $('province-capital').textContent = province.capital || province.name;
  $('province-merge').textContent = province.merged_from?.length
    ? province.merged_from.join(', ')
    : 'Không sáp nhập cấp tỉnh';
  $('merge-current').textContent = province.merged_from?.length
    ? `${fullProvinceName(province)} được hình thành từ ${province.merged_from.join(', ')}.`
    : `${fullProvinceName(province)} không thuộc nhóm sáp nhập cấp tỉnh trong dữ liệu này.`;

  const category = provinceCodeToQuizCategory[province.code] || 'all';
  $('quiz-category').value = category;
  renderMergeResults();
}

function postToMap(message) {
  const frame = $('map-frame');
  if (frame?.contentWindow) {
    frame.contentWindow.postMessage(message, window.location.origin);
  }
}

function mapFrameUrl(code = state.selectedCode) {
  return `/map?province=${encodeURIComponent(code)}&embedded=1&v=${MAP_FRAME_VERSION}`;
}

function loadMapFrame(options = {}) {
  const frame = $('map-frame');
  if (!frame) return;
  const nextUrl = mapFrameUrl();
  const currentUrl = frame.getAttribute('src') || '';
  if (options.force || !currentUrl.startsWith('/map')) {
    state.mapFrameLoaded = false;
    frame.setAttribute('src', nextUrl);
  }
}

function syncMapToSelectedProvince() {
  loadMapFrame();
  postToMap({ type: 'invalidateSize' });
  postToMap({ type: 'selectProvince', code: state.selectedCode });
  window.setTimeout(() => {
    postToMap({ type: 'invalidateSize' });
    postToMap({ type: 'selectProvince', code: state.selectedCode });
  }, 300);
}

function selectProvince(code) {
  if (!state.provinces.some(province => province.code === code)) return;
  state.selectedCode = code;
  renderProvinceList();
  updateProvinceDetails();
  syncMapToSelectedProvince();
}

function showNationalMap() {
  switchView('map-view');
  loadMapFrame();
  postToMap({ type: 'showNationalView' });
}

function showHome() {
  playSound('click');
  stopTimer();
  setMapDirectMode(false);
  if ($('result-dialog').open) $('result-dialog').close();
  $('workspace').classList.add('hidden');
  $('intro').classList.remove('hidden');
}

function switchView(viewId, options = {}) {
  state.activeView = viewId;
  setMapDirectMode(viewId === 'map-view' && Boolean(options.direct));
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewId);
  });
  document.querySelectorAll('.view').forEach(view => {
    view.classList.toggle('active', view.id === viewId);
  });

  if (viewId === 'map-view') {
    syncMapToSelectedProvince();
  }

  const labels = {
    'map-view': ['Báº£n Ä‘á»“ tÆ°Æ¡ng tĂ¡c', 'quiz-from-province-btn'],
    'merge-view': ['Tra cá»©u sĂ¡p nháº­p', 'quiz-from-province-btn'],
    'quiz-view': ['TrĂ² chÆ¡i tráº¯c nghiá»‡m', null],
  };
  $('mode-label').textContent = repairText(labels[viewId]?.[0] || '');
  $('quiz-from-province-btn').style.display = labels[viewId]?.[1] ? '' : 'none';
}

function renderQuizCategories() {
  const select = $('quiz-category');
  select.innerHTML = `<option value="all">${escapeHtml(repairText('Táº¥t cáº£ chá»§ Ä‘á»'))}</option>` + Object.entries(quizCategoryLabels)
    .map(([value, label]) => `<option value="${value}">${escapeHtml(repairText(label))}</option>`)
    .join('');
}

function rowsForSelectedProvince() {
  const code = state.selectedCode;
  const supplementalRows = [...supplementalMergeRows, ...lamDongOfficialMergeRows]
    .filter(row => String(row.province_code || '').padStart(2, '0') === code)
    .map(row => ({
      oldName: row.old_name,
      newName: row.new_name,
      provinceName: row.province_name,
      code: row.new_code,
      oldDistrict: row.old_district,
      area: row.area_km2,
      population: row.population,
      office: row.office,
      sourceName: row.source_name,
      sourceUrl: row.source_url,
      source: 'supplemental',
    }));
  const mergeRows = state.mergeRows
    .filter(row => String(row.province_code || '').padStart(2, '0') === code)
    .map(row => ({
      oldName: repairText(row.old_name),
      newName: repairText(row.new_name),
      provinceName: repairText(row.province_name),
      code: row.new_code,
      source: 'mapping',
    }));

  const communeRows = state.communeRows
    .filter(row => String(row.province_code || '').padStart(2, '0') === code)
    .flatMap(row => {
      const oldUnits = Array.isArray(row.old_units) ? row.old_units : [];
      return oldUnits.map(oldName => ({
        oldName: repairText(oldName),
        newName: repairText(row.name),
        provinceName: repairText(row.province_name),
        code: row.code,
        source: row.status,
      }));
    });

  return dedupeMergeRows([...supplementalRows, ...mergeRows, ...communeRows]);
}

function rowCompleteness(row) {
  return ['code', 'oldDistrict', 'area', 'population', 'office', 'sourceUrl']
    .reduce((score, key) => score + (row[key] ? 1 : 0), 0);
}

function mergeDuplicateRows(existing, incoming) {
  const primary = rowCompleteness(incoming) > rowCompleteness(existing) ? incoming : existing;
  const secondary = primary === incoming ? existing : incoming;
  return {
    ...secondary,
    ...primary,
    oldName: primary.oldName || secondary.oldName,
    provinceName: primary.provinceName || secondary.provinceName,
    sourceName: primary.sourceName || secondary.sourceName,
    sourceUrl: primary.sourceUrl || secondary.sourceUrl,
  };
}

function dedupeMergeRows(rows) {
  const byKey = new Map();
  rows.forEach(row => {
    const key = [
      normalize(row.provinceName || fullProvinceName(selectedProvince())),
      normalize(row.newName),
      String(row.code || '').trim(),
    ].join('|');
    if (!key.replace(/\|/g, '')) return;
    const existing = byKey.get(key);
    byKey.set(key, existing ? mergeDuplicateRows(existing, row) : row);
  });
  return [...byKey.values()];
}

function communeStatsForSelectedProvince() {
  const code = state.selectedCode;
  const rows = state.communeRows.filter(row => String(row.province_code || '').padStart(2, '0') === code);
  const merged = rows.filter(row => Array.isArray(row.old_units) && row.old_units.length > 0).length;
  const communes = rows.filter(row => row.type === 'xa').length;
  const wards = rows.filter(row => row.type === 'phuong').length;
  const special = rows.filter(row => row.type === 'dac_khu').length;
  return {
    total: rows.length,
    communes,
    wards,
    special,
    merged,
    unchanged: Math.max(rows.length - merged, 0),
  };
}

function fallbackProfile(province) {
  const mergedFrom = province.merged_from?.length ? province.merged_from.join(', ') : 'không thuộc nhóm sáp nhập cấp tỉnh trong dữ liệu này';
  const region = regionProfiles[province.region] || regionProfiles['Đồng bằng sông Hồng'];
  const products = provinceProducts[province.code] || ['Sản phẩm OCOP', 'Nông sản địa phương', 'Du lịch địa phương'];
  return {
    overview: `${fullProvinceName(province)} thuộc vùng ${province.region || 'chưa rõ'}, trung tâm hành chính: ${province.capital || province.name}. Đơn vị được hình thành từ ${mergedFrom}.`,
    economy: region.economy,
    culture: region.culture,
    society: [
      ...region.society,
      'Số liệu xã/phường và ánh xạ cũ - mới được lấy từ bộ dữ liệu hành chính đầy đủ đang dùng trong ứng dụng.'
    ],
    products,
    images: [],
    sources: [
      {
        label: 'Cổng Thông tin điện tử Chính phủ: Nghị quyết 202/2025/QH15 về sắp xếp đơn vị hành chính cấp tỉnh',
        url: 'https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-quyet-so-202-2025-qh15-ve-sap-xep-don-vi-hanh-chinh-cap-tinh-119250612174148722.htm'
      }
    ]
  };
}

function renderList(items) {
  return `<ul>${items.map(item => `<li>${escapeHtml(repairText(item))}</li>`).join('')}</ul>`;
}

function sceneGraphic(kind, palette) {
  const scenes = {
    sea: `
      <rect y="318" width="960" height="222" fill="${palette[2]}" opacity=".85"/>
      <path d="M0 354c120-42 220-42 340 0s238 42 356 0 184-42 264 0" fill="none" stroke="#fff" stroke-width="18" opacity=".72"/>
      <path d="M632 250l82 68h-164z" fill="${palette[1]}"/><rect x="706" y="208" width="16" height="110" fill="#334155"/><path d="M722 210l116 44-116 44z" fill="#f8fafc"/>
    `,
    island: `
      <rect y="320" width="960" height="220" fill="${palette[2]}" opacity=".82"/>
      <ellipse cx="610" cy="342" rx="210" ry="44" fill="${palette[1]}" opacity=".88"/>
      <path d="M580 330c40-92 118-110 180-94-58 24-96 62-128 118z" fill="#166534"/>
      <path d="M686 330c20-80 68-126 128-138-30 54-42 112-38 174z" fill="#15803d"/>
    `,
    mountain: `
      <path d="M0 408l194-206 118 132 120-178 180 252z" fill="${palette[1]}" opacity=".9"/>
      <path d="M286 408l190-238 150 164 96-106 238 180z" fill="${palette[2]}" opacity=".74"/>
      <path d="M432 156l44 62 38-48 56 80-138-2z" fill="#f8fafc" opacity=".8"/>
    `,
    heritage: `
      <rect x="528" y="260" width="280" height="146" fill="${palette[1]}" opacity=".86"/>
      <path d="M500 260h336l-168-92z" fill="${palette[2]}"/>
      <rect x="566" y="304" width="48" height="102" fill="#f8fafc" opacity=".82"/>
      <rect x="646" y="304" width="48" height="102" fill="#f8fafc" opacity=".82"/>
      <rect x="726" y="304" width="48" height="102" fill="#f8fafc" opacity=".82"/>
      <rect x="488" y="406" width="368" height="28" fill="#334155"/>
    `,
    city: `
      <rect x="520" y="196" width="76" height="224" fill="${palette[1]}" opacity=".88"/>
      <rect x="620" y="146" width="98" height="274" fill="#334155" opacity=".9"/>
      <rect x="746" y="238" width="82" height="182" fill="${palette[2]}" opacity=".86"/>
      <path d="M500 420h360" stroke="#f8fafc" stroke-width="22" opacity=".64"/>
      <g fill="#f8fafc" opacity=".75"><rect x="542" y="224" width="18" height="18"/><rect x="642" y="178" width="18" height="18"/><rect x="780" y="268" width="18" height="18"/><rect x="680" y="244" width="18" height="18"/></g>
    `,
    industry: `
      <rect x="524" y="302" width="314" height="116" fill="${palette[1]}" opacity=".88"/>
      <rect x="570" y="214" width="44" height="88" fill="#334155"/>
      <rect x="678" y="176" width="52" height="126" fill="#475467"/>
      <path d="M524 302l78-58 72 58 82-66 82 66z" fill="${palette[2]}" opacity=".9"/>
      <circle cx="760" cy="172" r="34" fill="#f8fafc" opacity=".55"/>
    `,
    forest: `
      <path d="M540 398l72-168 72 168z" fill="${palette[1]}"/>
      <path d="M640 408l96-226 96 226z" fill="#166534"/>
      <path d="M500 416h372" stroke="${palette[2]}" stroke-width="34" opacity=".72"/>
      <rect x="610" y="340" width="18" height="76" fill="#854d0e"/><rect x="734" y="340" width="20" height="76" fill="#854d0e"/>
    `,
    craft: `
      <circle cx="666" cy="304" r="118" fill="${palette[1]}" opacity=".86"/>
      <circle cx="666" cy="304" r="70" fill="${palette[0]}" opacity=".92"/>
      <path d="M566 384c70-64 132-64 202 0" fill="none" stroke="${palette[2]}" stroke-width="30" stroke-linecap="round"/>
      <path d="M572 232c64 46 126 46 188 0" fill="none" stroke="#334155" stroke-width="18" stroke-linecap="round" opacity=".72"/>
    `,
    field: `
      <path d="M0 356c132-40 256-40 372 0s238 40 356 0 180-40 232 0v184H0z" fill="${palette[1]}" opacity=".78"/>
      <path d="M0 430c122-46 230-46 324 0s210 46 342 0 218-46 294 0v110H0z" fill="${palette[2]}" opacity=".72"/>
      <g stroke="#f8fafc" stroke-width="8" opacity=".54"><path d="M552 382c48-50 48-110 0-178"/><path d="M640 408c44-64 44-136 0-216"/><path d="M730 402c40-54 40-116 0-186"/></g>
    `,
    water: `
      <rect y="332" width="960" height="208" fill="${palette[2]}" opacity=".8"/>
      <path d="M0 356c96-32 190-32 282 0s190 32 294 0 210-32 384 0" fill="none" stroke="#f8fafc" stroke-width="16" opacity=".72"/>
      <path d="M548 292h238c-32 72-76 108-132 108s-92-36-106-108z" fill="${palette[1]}" opacity=".9"/>
      <path d="M572 292c52-46 112-46 180 0" fill="none" stroke="#334155" stroke-width="14" stroke-linecap="round"/>
    `,
  };
  return scenes[kind] || scenes.field;
}

function profileImageDataUri(province, theme = [], index = 0) {
  const title = escapeHtml(fullProvinceName(province));
  const [themeTitle, themeSubtitle, kind = 'field'] = theme;
  const subtitle = escapeHtml(themeTitle || province.region || 'Việt Nam');
  const productText = escapeHtml(themeSubtitle || 'Sản phẩm địa phương');
  const palette = {
    sea: ['#dbeafe', '#0369a1', '#38bdf8'],
    island: ['#ecfeff', '#0f766e', '#22d3ee'],
    mountain: ['#ecfccb', '#365314', '#84cc16'],
    heritage: ['#fff7ed', '#9a3412', '#f59e0b'],
    city: ['#eef2ff', '#3730a3', '#06b6d4'],
    industry: ['#f1f5f9', '#334155', '#f97316'],
    forest: ['#dcfce7', '#166534', '#65a30d'],
    craft: ['#fef3c7', '#a16207', '#14b8a6'],
    field: ['#fefce8', '#4d7c0f', '#f59e0b'],
    water: ['#e0f2fe', '#0f766e', '#38bdf8'],
  }[province.region] || ['#e5eef7', '#1f3a5f', '#16a085'];
  const themePalette = ({
    sea: ['#dbeafe', '#0369a1', '#38bdf8'],
    island: ['#ecfeff', '#0f766e', '#22d3ee'],
    mountain: ['#ecfccb', '#365314', '#84cc16'],
    heritage: ['#fff7ed', '#9a3412', '#f59e0b'],
    city: ['#eef2ff', '#3730a3', '#06b6d4'],
    industry: ['#f1f5f9', '#334155', '#f97316'],
    forest: ['#dcfce7', '#166534', '#65a30d'],
    craft: ['#fef3c7', '#a16207', '#14b8a6'],
    field: ['#fefce8', '#4d7c0f', '#f59e0b'],
    water: ['#e0f2fe', '#0f766e', '#38bdf8'],
  })[kind] || palette;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540">
      <rect width="960" height="540" fill="${themePalette[0]}"/>
      <circle cx="${790 - index * 70}" cy="${112 + index * 26}" r="58" fill="#facc15" opacity=".9"/>
      ${sceneGraphic(kind, themePalette)}
      <rect x="54" y="58" width="560" height="202" rx="18" fill="rgba(255,255,255,.86)"/>
      <text x="86" y="118" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="#10233f">${title}</text>
      <text x="86" y="174" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="#10233f">${subtitle}</text>
      <text x="86" y="218" font-family="Arial, sans-serif" font-size="23" font-weight="700" fill="${themePalette[1]}">${productText}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function generatedProfileImages(province, products = []) {
  const themes = provinceImageThemes[province.code] || products.slice(0, 3).map(product => [product, `${fullProvinceName(province)} - sản phẩm địa phương`, 'field']);
  return themes.map((theme, index) => ({
    src: profileImageDataUri(province, theme, index),
    caption: `${theme[0]} - ${theme[1]}`,
  }));
}

function renderProvinceProfile() {
  const province = selectedProvince();
  if (!$('province-profile') || !province) return;

  const profile = provinceProfiles[province.code] || fallbackProfile(province);
  const stats = profile.stats || communeStatsForSelectedProvince();
  const sources = profile.sources?.length
    ? profile.sources.map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)}</a>`).join('')
    : '<span>Đang cập nhật nguồn chính thống cho địa phương này.</span>';
  const profileImages = profile.images?.length ? profile.images : generatedProfileImages(province, profile.products || []);
  const images = profileImages.length
    ? profileImages.map(image => `
        <figure>
          <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.caption)}" loading="lazy">
          <figcaption>${escapeHtml(image.caption)}</figcaption>
        </figure>
      `).join('')
    : '<div class="profile-image-placeholder">Hình ảnh minh họa đang cập nhật</div>';

  $('province-profile').innerHTML = `
    <section class="profile-card profile-hero">
      <div>
        <p class="profile-kicker">Hồ sơ tỉnh/thành phố</p>
        <h3>${escapeHtml(fullProvinceName(province))}</h3>
        <p>${escapeHtml(repairText(profile.overview))}</p>
      </div>
      <div class="profile-stats">
        <div><span>Số xã/phường</span><strong>${stats.total || 'Đang cập nhật'}</strong>${stats.wards !== undefined ? `<small>${stats.communes} xã, ${stats.wards} phường, ${stats.special} đặc khu</small>` : ''}</div>
        <div><span>Sáp nhập từ</span><strong>${escapeHtml(province.merged_from?.join(', ') || 'Không sáp nhập cấp tỉnh')}</strong></div>
        <div><span>Trung tâm</span><strong>${escapeHtml(province.capital || province.name)}</strong></div>
        ${stats.source ? `<div><span>Căn cứ</span><strong>${escapeHtml(stats.source)}</strong></div>` : ''}
      </div>
    </section>

    <section class="profile-grid">
      <article class="profile-card">
        <h4>Kinh tế</h4>
        ${renderList(profile.economy || [])}
      </article>
      <article class="profile-card">
        <h4>Văn hóa</h4>
        ${renderList(profile.culture || [])}
      </article>
      <article class="profile-card">
        <h4>Xã hội</h4>
        ${renderList(profile.society || [])}
      </article>
      <article class="profile-card">
        <h4>Sản phẩm địa phương</h4>
        <div class="product-tags">${(profile.products || []).map(product => `<span>${escapeHtml(product)}</span>`).join('')}</div>
      </article>
    </section>

    <section class="profile-card">
      <h4>Hình ảnh minh họa</h4>
      <div class="profile-images">${images}</div>
    </section>

    <section class="profile-card profile-sources">
      <h4>Nguồn tham khảo</h4>
      <div>${sources}</div>
    </section>
  `;
}

function renderMergeResults() {
  const query = normalize($('merge-search').value);
  if (!query) {
    $('merge-results').innerHTML = `
      <article class="merge-result merge-empty">
        <h4>Nhập tên xã/phường cũ hoặc mới để tra cứu</h4>
        <p>Ứng dụng chỉ hiển thị kết quả sau khi bạn nhập từ khóa, không liệt kê toàn bộ đơn vị ra ngoài.</p>
      </article>
    `;
    renderProvinceProfile();
    return;
  }
  let rows = rowsForSelectedProvince();
  if (query) {
    rows = [...supplementalMergeRows, ...lamDongOfficialMergeRows, ...state.mergeRows]
      .filter(row => !row.province_code || String(row.province_code).padStart(2, '0') === state.selectedCode)
      .map(row => ({
      oldName: repairText(row.old_name || row.oldName),
      newName: repairText(row.new_name || row.newName),
      provinceName: repairText(row.province_name || row.provinceName),
      code: row.new_code || row.code,
      oldDistrict: repairText(row.old_district || row.oldDistrict),
      area: row.area_km2 || row.area,
      population: row.population,
      office: repairText(row.office),
      sourceName: repairText(row.source_name || row.sourceName),
      sourceUrl: row.source_url || row.sourceUrl,
      source: row.source || 'mapping',
    })).filter(row => normalize(`${row.oldName} ${row.newName} ${row.provinceName} ${row.code}`).includes(query));
    rows = dedupeMergeRows(rows);
  }

  rows = rows.slice(0, 36);
  if (!rows.length) {
    $('merge-results').innerHTML = `
      <article class="merge-result">
        <h4>${escapeHtml(repairText('ChÆ°a cĂ³ káº¿t quáº£ phĂ¹ há»£p'))}</h4>
        <p>${escapeHtml(repairText('Dá»¯ liá»‡u hiá»‡n cĂ³ 3.321 xĂ£/phÆ°á»ng/Ä‘áº·c khu vĂ  10.977 Ă¡nh xáº¡ cÅ© - má»›i. Vui lĂ²ng thá»­ tĂªn khĂ¡c hoáº·c bá» dáº¥u.'))}</p>
      </article>
    `;
    renderProvinceProfile();
    return;
  }

  $('merge-results').innerHTML = rows.map(row => `
    <article class="merge-result">
      <h4>${escapeHtml(row.newName || repairText('KhĂ´ng rĂµ'))}</h4>
      <p><b>${escapeHtml(repairText('MĂ£ má»›i'))}:</b> ${escapeHtml(row.code || repairText('KhĂ´ng rĂµ'))}</p>
      <p><b>${escapeHtml(repairText('Tá»« Ä‘Æ¡n vá»‹ cÅ©'))}:</b> ${escapeHtml(row.oldName || repairText('KhĂ´ng rĂµ'))}</p>
      ${row.oldDistrict ? `<p><b>Huyện cũ:</b> ${escapeHtml(row.oldDistrict)}</p>` : ''}
      ${row.area ? `<p><b>Diện tích:</b> ${escapeHtml(String(row.area))} km²</p>` : ''}
      ${row.population ? `<p><b>Dân số:</b> ${escapeHtml(new Intl.NumberFormat('vi-VN').format(row.population))} người</p>` : ''}
      ${row.office ? `<p><b>Trụ sở:</b> ${escapeHtml(row.office)}</p>` : ''}
      <p><b>${escapeHtml(repairText('Tá»‰nh/thĂ nh'))}:</b> ${escapeHtml(row.provinceName || fullProvinceName(selectedProvince()))}</p>
      ${row.sourceUrl ? `<p><b>Nguồn:</b> <a href="${escapeHtml(row.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(row.sourceName || 'Nguồn tham khảo')}</a></p>` : ''}
    </article>
  `).join('');
  renderProvinceProfile();
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startQuiz() {
  const category = $('quiz-category').value;
  const pool = category === 'all'
    ? state.quizQuestions
    : state.quizQuestions.filter(question => String(question.category) === String(category));
  state.currentQuiz = shuffle(pool).slice(0, 10);
  state.questionIndex = 0;
  state.score = 0;
  $('quiz-score').textContent = '0';
  $('quiz-feedback').textContent = '';
  $('quiz-feedback').classList.remove('bad');
  if (!state.currentQuiz.length) {
    $('question-text').textContent = 'Chưa có câu hỏi cho chủ đề này.';
    $('answer-grid').innerHTML = '';
    return;
  }
  showQuestion();
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function startTimer() {
  stopTimer();
  state.timeLeft = 20;
  $('quiz-timer').textContent = state.timeLeft;
  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    $('quiz-timer').textContent = state.timeLeft;
    if (state.timeLeft <= 0) {
      handleAnswer(null);
    }
  }, 1000);
}

function showQuestion() {
  stopTimer();
  state.currentQuestion = state.currentQuiz[state.questionIndex];
  if (!state.currentQuestion) {
    finishQuiz();
    return;
  }

  const question = state.currentQuestion;
  $('quiz-progress').textContent = `${state.questionIndex + 1}/${state.currentQuiz.length}`;
  $('question-text').textContent = repairText(question.question);
  $('quiz-feedback').textContent = '';
  $('quiz-feedback').classList.remove('bad');
  $('answer-grid').innerHTML = Object.entries(question.choices).map(([key, text]) => `
    <button class="answer-button" type="button" data-answer="${key}">
      <span class="answer-key">${key}</span>${escapeHtml(repairText(text))}
    </button>
  `).join('');

  document.querySelectorAll('.answer-button').forEach(button => {
    button.addEventListener('click', () => handleAnswer(button.dataset.answer));
  });
  startTimer();
}

function handleAnswer(answer) {
  if (!state.currentQuestion) return;
  stopTimer();

  const correct = state.currentQuestion.answer;
  const isCorrect = answer === correct;
  const correctText = repairText(state.currentQuestion.choices?.[correct] || '');
  document.querySelectorAll('.answer-button').forEach(button => {
    button.disabled = true;
    if (button.dataset.answer === correct) button.classList.add('correct');
    if (answer && button.dataset.answer === answer && !isCorrect) button.classList.add('wrong');
  });

  if (isCorrect) {
    state.score += 1;
    $('quiz-score').textContent = state.score;
    $('quiz-feedback').textContent = 'Chính xác.';
    $('quiz-feedback').classList.remove('bad');
    playSound('correct');
  } else {
    const correctLabel = correctText ? `${correct}. ${correctText}` : correct;
    $('quiz-feedback').textContent = answer ? `Chưa đúng. Đáp án đúng là ${correctLabel}.` : `Hết thời gian. Đáp án đúng là ${correctLabel}.`;
    $('quiz-feedback').classList.add('bad');
    playSound('select');
  }

  state.currentQuestion = null;
  window.setTimeout(() => {
    state.questionIndex += 1;
    showQuestion();
  }, 1200);
}

function finishQuiz() {
  stopTimer();
  const total = state.currentQuiz.length || 10;
  const passed = state.score >= Math.ceil(total * 0.7);
  $('result-image').src = passed ? '/python/assets/win-banner.svg' : '/python/assets/lose-banner.png';
  $('result-title').textContent = passed ? 'Hoàn thành xuất sắc' : 'Cần luyện thêm';
  $('result-message').textContent = `Bạn đạt ${state.score}/${total} câu đúng.`;
  $('quiz-progress').textContent = `${total}/${total}`;
  $('quiz-timer').textContent = '0';
  playSound(passed ? 'win' : 'lose');
  $('result-dialog').showModal();
}

function bindEvents() {

  $('sound-toggle').addEventListener('click', () => {
    state.soundOn = !state.soundOn;
    $('sound-toggle').classList.toggle('off', !state.soundOn);
    $('sound-toggle').textContent = state.soundOn ? 'â™ª' : 'Ă—';
  });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      playSound('click');
      if (tab.dataset.view === 'map-view') {
        loadMapFrame({ force: true });
        switchView('map-view');
        return;
      }
      switchView(tab.dataset.view);
    });
  });

  $('map-frame').addEventListener('load', () => {
    state.mapFrameLoaded = true;
    syncMapToSelectedProvince();
  });

  $('province-search').addEventListener('input', filterProvinceList);
  $('merge-search').addEventListener('input', renderMergeResults);
  $('home-btn').addEventListener('click', showHome);
  $('national-btn').addEventListener('click', showNationalMap);
  $('quiz-from-province-btn').addEventListener('click', () => {
    const category = provinceCodeToQuizCategory[state.selectedCode] || 'all';
    $('quiz-category').value = category;
    switchView('quiz-view');
    startQuiz();
  });
  $('new-quiz-btn').addEventListener('click', () => {
    playSound('click');
    startQuiz();
  });
  $('close-result-btn').addEventListener('click', () => $('result-dialog').close());

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.mapDirectMode) {
      switchView('map-view', { direct: false });
      postToMap({ type: 'selectProvince', code: state.selectedCode });
    }
  });
}

function startServerLifecycleHeartbeat() {
  const clientId = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
  const payload = () => JSON.stringify({ id: clientId });

  const sendHeartbeat = () => {
    fetch('/api/client-heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload(),
      keepalive: true,
    }).catch(() => {});
  };

  const sendClosed = () => {
    const body = new Blob([payload()], { type: 'application/json' });
    if (!navigator.sendBeacon?.('/api/client-closed', body)) {
      fetch('/api/client-closed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload(),
        keepalive: true,
      }).catch(() => {});
    }
  };

  sendHeartbeat();
  window.setInterval(sendHeartbeat, 5000);
  window.addEventListener('pagehide', sendClosed);
  window.addEventListener('beforeunload', sendClosed);
}

async function init() {
  repairStaticDomText();
  startServerLifecycleHeartbeat();
  $('start-btn').addEventListener('click', event => {
    playSound('click');
    $('intro').classList.add('hidden');
    $('workspace').classList.remove('hidden');
    loadMapFrame({ force: true });
    switchView('map-view');
  });

  await loadData();
  renderQuizCategories();
  renderProvinceList();
  updateProvinceDetails();
  bindEvents();
}

init().catch(error => {
  console.error(error);
  $('intro').classList.add('hidden');
  $('workspace').classList.remove('hidden');
  $('selected-title').textContent = 'KhĂ´ng khá»Ÿi táº¡o Ä‘Æ°á»£c dá»¯ liá»‡u';
});

