// Kiểm tra nếu có SW mới thì reload lại trang
navigator.serviceWorker.oncontrollerchange = () => location.reload();

// Phiên bản ứng dụng
const phienBan = '0.8.1',
  ngayCapNhat = '(01.12.2023)';
// Nội dung cập nhật
const noiDungCapNhat = `
- Cập nhật hệ thống lưu dữ liệu mới
- Sửa đổi, cập nhật mã nguồn`;

// Các biến khởi tạo ban đầu
const $ = document.querySelector.bind(document); // Viết ngắn gọn của hàm querySelector
$('#version').innerText = `Phiên bản ${phienBan}`;
const today = new Date();
$('#tuyChon')[1].innerText += ` ${today.getFullYear()}`;
$('#chonNgay').value = `${today.getFullYear()}-${('0' + (today.getMonth() + 1)).slice(-2)}-${('0' + today.getDate()).slice(-2)}`;
const chonThang = $('#chonThang');
chonThang.value = today.getMonth() + 1;
const tbody = $('table>tbody');
const nam = today.getFullYear();
const thu = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
let thang = chonThang.value;
let tenThu = thu[today.getDay()];
let ngay = today.getDate();
let data; // Dữ liệu tăng ca
let xemDayDu = false; // Xem đầy đủ dữ liệu bao gồm lcb và cơm khi hiển thị

//========== Sửa dữ liệu trong localStorage từ ver 0.8 (16.11.2023)
if (localStorage[nam] != null) {
  localStorage[`TCA-${nam}`] = localStorage[nam];
  delete localStorage[nam];
  localStorage['TCA-phienBan'] = localStorage['phienBan'];
  delete localStorage['phienBan'];
  localStorage['TCA-coChu'] = localStorage['coChu'];
  delete localStorage['coChu'];
  localStorage['TCA-lcb'] = localStorage['lcb'];
  delete localStorage['lcb'];
  localStorage['TCA-gtcGanDay'] = localStorage['gtcGanDay'];
  delete localStorage['gtcGanDay'];
  localStorage['TCA-tienCom'] = localStorage['tienCom'];
  delete localStorage['tienCom'];
  localStorage['TCA-apDungTienCom'] = localStorage['apDungTienCom'];
  delete localStorage['apDungTienCom'];
}
else if (localStorage['coChu'] != null) {
  delete localStorage['phienBan'];
  delete localStorage['coChu'];
  delete localStorage['lcb'];
  delete localStorage['gtcGanDay'];
  delete localStorage['tienCom'];
  delete localStorage['apDungTienCom'];
}
//==========

(function appStart() {
  // Thông báo nếu có phiên bản mới
  if (localStorage['TCA-phienBan'] == null)
    localStorage['TCA-phienBan'] = phienBan;
  else if (phienBan != localStorage['TCA-phienBan']) {
    const oldVer = localStorage['TCA-phienBan'];
    localStorage['TCA-phienBan'] = phienBan;
    setTimeout(() => alert(`•••  THÔNG BÁO CẬP NHẬT  •••\n\nĐã cập nhật phiên bản:  ${oldVer}  lên  ${phienBan}\n\n----------\n\nNội dung cập nhật bao gồm:\n${noiDungCapNhat}`), 200);
  }

  // Kiểm tra lưu dữ liệu khi hết năm
  if (localStorage[`TCA-${nam}`] == null) {
    const year = kiemTraLuuDuLieu(true);
    if (localStorage[`TCA-${year}`] != null) {
      data = JSON.parse(localStorage[`TCA-${year}`]);
      thongKeNam(true);
    }
  }

  // Lấy dữ liệu ban đầu nếu có
  if (localStorage[`TCA-${nam}`] != null) {
    data = JSON.parse(localStorage[`TCA-${nam}`]);
    if (data[thang] == null)
      data[thang] = {}
  }
  else {
    data = {
      [thang]: {}
    }
    if (localStorage['TCA-coChu'] == null) {
      localStorage['TCA-coChu'] = '14';
      localStorage['TCA-tienCom'] = '13000';
      localStorage['TCA-apDungTienCom'] = '1';
    }
    setTimeout(() => alert(`•••  CHÀO MỪNG TĂNG CA ${nam}  •••\n
  1. Đề xuất sử dụng trình duyệt Chrome cho Android và Safari cho IOS. Tránh sử dụng các trình duyệt Web được tích hợp trong các ứng dụng mạng xã hội như: Facebook Messenger, Zalo v.v.. vì có thể sẽ bị lỗi hoặc mất dữ liệu không mong muốn\n
  2. Dữ liệu tăng ca được lưu trong 'Local Storage' (một Api lưu dữ liệu cục bộ trên trình duyệt Web này), nếu xoá dữ liệu trang Web của trình duyệt này, tất cả dữ liệu tăng ca sẽ bị mất, riêng lịch sử duyệt Web hoặc dữ liệu khác như: Bộ đệm hoặc các cài đặt trang Web bị xoá sẽ không ảnh hưởng đến dữ liệu đã lưu\n
  3. Tất cả dữ liệu người dùng được lưu cố định trên trình duyệt Web này, nếu sử dụng một trình duyệt Web khác hoặc tab riêng tư để truy cập sẽ không tìm thấy dữ liệu đã được lưu trước đó`), 200);
  }

  // Cỡ chữ ban đầu
  setFontSize(localStorage['TCA-coChu']);

  // Ẩn các tháng lớn hơn tháng hiện tại
  for (let i = (today.getMonth() + 1); i < 12; i++) {
    chonThang[i].disabled = true;
  }

  // Hiển thị lương cơ bản của thẻ th trong tbody
  $('#thLcb').innerText = `Lương cơ bản: ${localStorage['TCA-lcb'] != null ? tinhTien(parseInt(localStorage['TCA-lcb'])) + ' đ' : 'Chưa có'}`;

  layDuLieu();
})();

// Test dữ liệu
/*for (i = 1; i <= 12; i++) {
  if (data[i] == null)
    data[i] = {};
  for (j = 1; j <= 31; j++)
    data[i][j] = { thoiGian: `${tenThu} • Ngày ${j}`, gtc: 1.5, lcb: 6241000, com: 13000 };
}*/

// Hàm kiểm tra dữ liệu cũ khi sang năm tiếp theo
function kiemTraLuuDuLieu(kiemTra = false) {
  if (!kiemTra) return nam;
  else {
    for (let i = nam - 1; i > nam - 4; i--) {
      if (`TCA-${i}` in localStorage)
        return i;
    }
  }
}

function setFontSize(sizes) {
  const size = sizes + 'px';
  $('#version').style.fontSize = size;
  $('#chonThang').style.fontSize = size;
  $('#chonNgay').style.fontSize = size;
  $('#tuyChon').style.fontSize = size;
  $('#thLcb').style.fontSize = size;
  $('#thGioTC').style.fontSize = size;
  tbody.style.fontSize = size;
  $('#btnThem').style.fontSize = size;
  $('#inputUpload').style.fontSize = size;
  $('#btnThoatKhoiPhuc').style.fontSize = size;
  $('#btnKhoiPhuc').style.fontSize = size;
  $('#textThongBao').style.fontSize = size;
  $('#btnThoatThongBao').style.fontSize = size;
}

// Hàm hiện thông báo
function popUpThongBao(text) {
  document.body.style.overflow = 'hidden';
  $('#divThongBao').style.display = 'block';
  $('#textThongBao').innerText = `\n${text}\n\n`;
}

function thayDoiThang() {
  thang = chonThang.value;
  $('#chonNgay').value = `${today.getFullYear()}-${('0' + thang).slice(-2)}-${thang == (today.getMonth() + 1) ? ('0' + today.getDate()).slice(-2) : '01'}`;
  const date = new Date($('#chonNgay').value);
  tenThu = thu[date.getDay()];
  ngay = date.getDate();
  if (data[thang] == null)
    data[thang] = {}
  layDuLieu();
}

function thayDoiNgay(e) {
  const todays = new Date(e.target.value);
  tenThu = thu[todays.getDay()];
  ngay = todays.getDate();
}

function menuTuyChon() {
  const tc = $('#tuyChon');
  if (tc.value == 'thongKe') thongKeNam();
  else if (tc.value == 'duLieuDaLuu') duLieuDaLuu();
  else if (tc.value == 'coChu') doiCoChu();
  else if (tc.value == 'saoLuuDuLieu') saoLuuDuLieu();
  else if (tc.value == 'khoiPhucDuLieu') {
    if (confirm('•••  KHÔI PHỤC DỮ LIỆU  •••\n\nLưu ý:  Tất cả dữ liệu hiện tại sẽ được thay thế bằng dữ liệu trong tệp khôi phục\n\nNhấn OK và chọn tệp khôi phục'))
      setTimeout(() => $('#divUpload').style.display = 'block', 200);
  }
  else if (tc.value == 'tienCom') suaTienCom();
  else if (tc.value == 'tuyChonKhac') tuyChonKhac();
  else if (tc.value == 'thongTin') alert(`•••  THÔNG TIN WEB TĂNG CA  •••\n\nPhiên bản:  ${phienBan} ${ngayCapNhat}\n\nTác giả:  Nguyễn Phương Minh\n\nHỗ trợ, góp ý:  0969.442.210 (có Zalo)\n\n----------\n\n⭐ Hỗ trợ tác giả tách Café ☕ qua:\n\n❤️ Sacombank:  0501.0651.2997\n\n❤️ Momo:  0969.442.210`);
  tc.value = 'menu';
}

// Hàm đếm số ngày trong tháng trừ chủ nhật hoặc thứ bảy
/*function countDaysOfMonth(month, year, countSaturday = false) {
  const firstDay = new Date(year, month - 1, 1); // Tạo ngày đầu tiên của tháng
  const lastDay = new Date(year, month, 0); // Tạo ngày cuối cùng của tháng 
  let count = 0; // Khởi tạo biến đếm 
  while (firstDay <= lastDay) { // Lặp qua từng ngày trong tháng
    // Nếu không phải chủ nhật (0) và bỏ qua ngày thứ bảy nếu countSaturday là true
    if (firstDay.getDay() !== 0 && countSaturday ? firstDay.getDay() !== 6 : firstDay.getDay() !== 0) {
      count++; // Đếm ngày đó
    }
    firstDay.setDate(firstDay.getDate() + 1); // Tăng ngày lên 1
  }
  return count; // Trả về số nguyên tổng ngày đếm được
}*/

// Hàm Kiểm tra chốt ngày tăng ca
function chotNgayTC() {
  for (let i = 16; i <= 31; i++) {
    if (i in data[thang]) { // Nếu có dữ liệu một trong các thuộc tính (key) từ 16 - 31
      for (let i = 15; i > 0; i--) {
        if (i in data[thang]) // Nếu thuộc tính (key) thứ i có trong data
          return i; // Trả về giá trị và thoát khỏi vòng lặp, hàm
      }
    }
  }
  return 0; // Trả về 0 nếu các điều kiện ở trên là sai
}

function layDuLieu() {
  const dayOfMonth = 26; //countDaysOfMonth(thang, nam);
  const chotNgayTangCa = chotNgayTC(); // Lấy ngày chốt tăng ca
  tbody.innerHTML = null;
  let ngay = 0,
    gio = 0,
    tien = 0,
    chotNgay = 0,
    chotGio = 0,
    chotTien = 0;
  for ([key, value] of Object.entries(data[thang])) {
    ngay++;
    gio += value.gtc;
    tien += data[thang][key].lcb / dayOfMonth / 8 * 1.5 * data[thang][key].gtc + (localStorage['TCA-apDungTienCom'] == '1' && data[thang][key].gtc == 1.5 ? data[thang][key].com : 0);

    tbody.innerHTML += `
      <tr>
        <td onclick='suaDuLieu(${key})'>${value.thoiGian}${xemDayDu ? `<br><h5 style='margin: 2px; color: brown;'>Lcb: ${tinhTien(value.lcb)}</h5>` : ''}</td>
        <td onclick='xoaDuLieu(${key})'>${value.gtc}${xemDayDu && localStorage['TCA-apDungTienCom'] == '1' && value.gtc == 1.5 ? `<br><h5 style='margin: 2px; color: brown;'>Cơm: ${tinhTien(value.com)}</h5>` : ''}</td>
      </tr>`;

    if (key == chotNgayTangCa) {
      tbody.innerHTML += `<td colspan=2 style='color: brown; font-weight: bold; background-color: aliceblue;'>Đợt 1 • ${ngay} ngày • ${gio} tiếng • ${tinhTien(tien)} đ</td>`;
      chotNgay = ngay;
      chotGio = gio;
      chotTien = tien;
    }
  }

  if (tbody.innerHTML != '') {
    $('#thGioTC').innerText = `${gio} tiếng • ${tinhTien(tien)} đ`;
    if (chotNgayTangCa > 0)
      tbody.innerHTML += `<td colspan=2 style='color: brown; font-weight: bold; background-color: aliceblue;'>Đợt 2 • ${ngay - chotNgay} ngày • ${gio - chotGio} tiếng • ${tinhTien(tien - chotTien)} đ</td>`;
  }
  else {
    $('#thGioTC').innerText = `0 tiếng`;
    tbody.innerHTML = `<td onclick='themDuLieu()' colspan='2'>Tháng ${thang} chưa có dữ liệu</td>`;
    setTimeout(() => {
      if (localStorage['TCA-lcb'] == null)
        alert('Gợi ý:  Nhấn vào mục "Lương cơ bản" (màu xanh lá cây), để thêm lương cơ bản trước khi sử dụng!');
      else if (Object.keys(data[thang]).length == 0)
        alert('Gợi ý:  Nhấn vào mục "Thêm Dữ Liệu" để thêm giờ tăng ca!');
    }, 2000);
  }
}

function themDuLieu() {
  if (localStorage['TCA-lcb'] != null) {
    if (data[thang][ngay] == undefined) {
      const value = prompt(`•••  THÊM DỮ LIỆU  •••\n\n${tenThu} • Ngày ${ngay}\n\nVí dụ:  Nhập  ${1.5}  hoặc  ${3.5}  v.v..`, `${localStorage['TCA-gtcGanDay'] == null ? 1.5 : localStorage['TCA-gtcGanDay']}`);
      if (value != null) {
        if (!isNaN(value) && parseFloat(value) > 0) {
          data[thang][ngay] = { thoiGian: `${tenThu} • Ngày ${ngay}`, gtc: parseFloat(value), lcb: parseInt(localStorage['TCA-lcb']), com: parseInt(localStorage['TCA-tienCom']) };
          alert(`Đã thêm dữ liệu:\n\n${tenThu} • Ngày ${ngay}:  ${value}  tiếng`);
          setTimeout(layDuLieu, 500);
          localStorage[`TCA-${nam}`] = JSON.stringify(data);
          localStorage['TCA-gtcGanDay'] = value;
        } else {
          alert('Giá trị nhập vào không hợp lệ!');
          themDuLieu();
        }
      }
    } else alert(`Dữ liệu đã tồn tại:\n\n${tenThu} • Ngày ${ngay}:  ${data[thang][ngay].gtc}  tiếng`);
  }
  else {
    const lcb = prompt('•••  THÔNG BÁO HỆ THỐNG  •••\n\nHệ thống yêu cầu có lương cơ bản để tính toán tiền tăng ca, vui lòng nhập lương cơ bản trước khi sử dụng (bắt buộc)\n\nLưu ý:  Hãy nhập đúng lương cơ bản, nếu nhập sai khi thêm dữ liệu hệ thống tính toán, thống kê tiền tăng ca sẽ bị sai\n\nGợi ý:  Sửa lại hoặc nhấn OK để tiếp tục', 6241000);
    if (lcb != null) {
      if (!isNaN(lcb) && parseInt(lcb) > 0) {
        if (confirm(`Lương cơ bản vừa nhập là:  ${tinhTien(parseInt(lcb))} đ\n\nNhấn OK để xác nhận`)) {
          localStorage['TCA-lcb'] = lcb;
          alert(`Lương cơ bản mới là:  ${tinhTien(parseInt(lcb))} đ`);
          $('#thLcb').innerText = `Lương cơ bản: ${tinhTien(parseInt(lcb))} đ`;
        } else alert('Chưa thay đổi lương cơ bản!');
      }
      else {
        alert('Lưu ý:  Lương cơ bản phải là giá trị số và lớn hơn 0');
        themDuLieu1
      }
    }
  }
}

function suaDuLieu(key) {
  const obj = data[thang][key];
  const value = prompt(`•••  SỬA GIỜ TĂNG CA  •••\n\n${obj.thoiGian}:  ${obj.gtc}  tiếng`, data[thang][key].gtc);
  if (value != null) {
    const val = value.split('=');
    if (value == 'pmi' || value == 'Pmi' || value == 'PMi') {
      xemDayDu = true;
      alert('Đã bật chế độ xem dữ liệu đầy đủ!');
      setTimeout(layDuLieu, 500);
    }
    else if (xemDayDu && (val[0] == 'lcb' || val[0] == 'Lcb') && !isNaN(val[1]) && parseInt(val[1]) > 0) {
      if (val[1] != obj.lcb) {
        data[thang][key].lcb = parseInt(val[1]);
        alert(`Đã cập nhật lương cơ bản!\n\n${obj.thoiGian}:  ${tinhTien(obj.lcb)} đ`);
        setTimeout(layDuLieu, 500);
        localStorage[`TCA-${nam}`] = JSON.stringify(data);
      } else alert('Lương cơ bản bị trùng!');
    }
    else if (xemDayDu && localStorage['TCA-apDungTienCom'] == '1' && obj.gtc == 1.5 && (val[0] == 'com' || val[0] == 'Com') && !isNaN(val[1]) && parseInt(val[1]) > 0) {
      if (val[1] != obj.com) {
        data[thang][key].com = parseInt(val[1]);
        alert(`Đã cập nhật tiền cơm!\n\n${obj.thoiGian}:  ${tinhTien(obj.com)} đ`);
        setTimeout(layDuLieu, 500);
        localStorage[`TCA-${nam}`] = JSON.stringify(data);
      } else alert('Tiền cơm bị trùng!');
    }
    else if (!isNaN(value) && parseFloat(value) > 0) {
      if (value != obj.gtc) {
        data[thang][key].gtc = parseFloat(value);
        alert(`Đã cập nhật giờ tăng ca!\n\n${obj.thoiGian}:  ${obj.gtc}  tiếng`);
        setTimeout(layDuLieu, 500);
        localStorage[`TCA-${nam}`] = JSON.stringify(data);
      } else alert(`Giờ tăng ca bị trùng!`);
    }
    else if (parseFloat(value) <= 0 || isNaN(value) || value.trim().length == 0) {
      alert('Giá trị cập nhật không hợp lệ!');
      suaDuLieu(key);
    }
  }
}

function xoaDuLieu(key) {
  if (confirm(`•••  XOÁ DỮ LIỆU  •••\n\n${data[thang][key].thoiGian}:  ${data[thang][key].gtc}  tiếng\n\nNhấn  OK  để xoá`)) {
    alert(`Đã xoá:  ${data[thang][key].thoiGian}`);
    delete data[thang][key];
    setTimeout(layDuLieu, 500);
    localStorage[`TCA-${nam}`] = JSON.stringify(data);
  }
}

function thongKeThang() {
  let ngay = 0,
    gio = 0,
    tien = 0,
    com = 0;
  for (value in data[thang]) {
    ngay++;
    gio += data[thang][value].gtc;
    com += localStorage['TCA-apDungTienCom'] == '1' && data[thang][value].gtc == 1.5 ? data[thang][value].com : 0;
    tien += data[thang][value].lcb / 26 / 8 * 1.5 * data[thang][value].gtc;
  }
  alert(`•••  THỐNG KÊ THÁNG ${thang}  •••\n
Tổng ngày t.ca:     ${ngay}  ngày\n
Tổng giờ t.ca:        ${gio}  tiếng
${com > 0 ? `\n----------\n
Tiền t.ca:               ${tinhTien(tien)} đ\n
Tiền cơm:              ${tinhTien(com)} đ\n` : ''}
Thành tiền:            ${tinhTien(tien + com)} đ`);
}

function thongKeNam(luuDuLieu = false) {
  const year = kiemTraLuuDuLieu(luuDuLieu);
  let result = `${!luuDuLieu ? 'THỐNG KÊ' : 'DỮ LIỆU'} TĂNG CA ${year}\n----------\n`;
  let tongNgay = 0,
    tongGtc = 0,
    tongTien = 0,
    tongCom = 0;

  for (let i = 1; i <= 12; i++) {
    let dayOfMonth = 26; //countDaysOfMonth(i, year),
    gio = 0,
      tien = 0,
      com = 0;
    for (value in data[i]) {
      tongNgay++;
      gio += data[i][value].gtc;
      com += localStorage['TCA-apDungTienCom'] == '1' && data[i][value].gtc == 1.5 ? data[i][value].com : 0;
      tien += data[i][value].lcb / dayOfMonth / 8 * 1.5 * data[i][value].gtc;
    }
    result += `Tháng ${i >= 10 ? i : '0' + i}:  ${gio}  tiếng${tien > 0 ? `  •  ${tinhTien(tien + com)} đ` : ''}\n`;
    tongGtc += gio;
    tongTien += tien;
    tongCom += com;
  }

  result += `----------
Tổng ngày:     ${tongNgay}  ngày
Tổng giờ:        ${tongGtc}  tiếng
Tổng tiền:       ${tinhTien(tongTien + tongCom)} đ`;

  if (!luuDuLieu) alert(result);
  else { // Kiểm tra lưu dữ liệu khi sang năm tiếp theo
    localStorage[`TCA-duLieu${year}`] = result;
    localStorage.removeItem(`TCA-${year}`);
    localStorage.removeItem(`TCA-duLieu${nam - 4}`);
    setTimeout(() => alert(`•••  LƯU DỮ LIỆU TĂNG CA  •••\n\nDữ liệu tăng ca ${year} đã được lưu!\n\nĐể xem lại dữ liệu tăng ca đã lưu, vào "Menu" chọn "Dữ Liệu Đã Lưu" sau đó nhập số năm có dữ liệu cần xem\n\nNhấn OK để tiếp tục`), 200);
  }
}

function duLieuDaLuu() {
  if (localStorage[`TCA-duLieu${nam - 1}`] != null || localStorage[`TCA-duLieu${nam - 2}`] != null || localStorage[`TCA-duLieu${nam - 3}`] != null) {
    const year = prompt(`•••  DỮ LIỆU ĐÃ LƯU  •••\n
Năm  ${nam - 1}:  ${localStorage[`TCA-duLieu${nam - 1}`] != null ? 'Có dữ liệu' : 'Không có dữ liệu'}
Năm  ${nam - 2}:  ${localStorage[`TCA-duLieu${nam - 2}`] != null ? 'Có dữ liệu' : 'Không có dữ liệu'}
Năm  ${nam - 3}:  ${localStorage[`TCA-duLieu${nam - 3}`] != null ? 'Có dữ liệu' : 'Không có dữ liệu'}\n
Chọn năm có dữ liệu cần xem:`, nam - 1);
    if (year != null) {
      if (!isNaN(year) && parseInt(year) >= nam - 3) {
        if (localStorage[`TCA-duLieu${year}`] != null)
          alert(localStorage[`TCA-duLieu${year}`]);
        else {
          alert(`Không có dữ liệu năm ${year}`);
          duLieuDaLuu();
        }
      } else {
        alert('Giá trị nhập vào không hợp lệ!');
        duLieuDaLuu();
      }
    }
  } else alert(`•••  THÔNG BÁO HỆ THỐNG  •••\n\nKhông có dữ liệu!\n\nKhi hết tháng 12 năm ${nam}, hệ thống sẽ tự động lưu dữ liệu (trong phạm vi 3 năm) để xem lại khi cần`);
}

function suaLuongCB() {
  const lcb = prompt('•••  THAY ĐỔI LƯƠNG CƠ BẢN  •••\n\nLưu ý:  Hãy nhập đúng lương cơ bản, nếu nhập sai khi thêm dữ liệu hệ thống tính toán, thống kê tiền tăng ca sẽ bị sai\n\nGợi ý:  Sửa lại hoặc nhấn OK để tiếp tục', `${localStorage['TCA-lcb'] == null ? 6241000 : localStorage['TCA-lcb']}`);
  if (lcb != null) {
    if (!isNaN(lcb) && parseInt(lcb) > 0) {
      if (confirm(`Lương cơ bản vừa nhập là:  ${tinhTien(parseInt(lcb))} đ\n\nNhấn OK để xác nhận`)) {
        alert(`Lương cơ bản mới là:  ${tinhTien(parseInt(lcb))} đ`);
        $('#thLcb').innerText = `Lương cơ bản: ${tinhTien(parseInt(lcb))} đ`;
        localStorage['TCA-lcb'] = lcb;
        if (today.getDate() in data[thang]) {
          data[thang][today.getDate()].lcb = parseInt(lcb);
          setTimeout(layDuLieu, 500);
          localStorage[`TCA-${nam}`] = JSON.stringify(data);
        }
      } else alert('Chưa thay đổi lương cơ bản!');
    } else {
      alert('Lưu ý:  Lương cơ bản phải là giá trị số và lớn hơn 0');
      suaLuongCB();
    }
  }
}

function suaTienCom() {
  const tc = prompt('•••  THAY ĐỔI TIỀN CƠM  •••\n\nÁp dụng với Cty LongFa\n\nSửa giá trị về 0 hoặc để trống nếu không cần áp dụng', localStorage['TCA-apDungTienCom'] == '0' ? 0 : localStorage['TCA-tienCom']);
  if (tc != null) {
    if (!isNaN(tc) && parseInt(tc) > 0) {
      alert(`Đã cập nhật tiền cơm:  ${tinhTien(parseInt(tc))} đ`);
      localStorage['TCA-tienCom'] = tc;
      if (today.getDate() in data[thang]) {
        data[thang][today.getDate()].com = parseInt(tc);
        localStorage[`TCA-${nam}`] = JSON.stringify(data);
      }
      if (localStorage['TCA-apDungTienCom'] == '0')
        localStorage['TCA-apDungTienCom'] = '1';
    }
    else if (tc == 0 || tc == '') {
      if (confirm('•••  THÔNG BÁO HỆ THỐNG  •••\n\nNếu không áp dụng tiền cơm, khi tính toán tiền tăng ca, thống kê tăng ca, hệ thống sẽ bỏ qua tiền cơm nếu có\n\nNhấn OK để xác nhận')) {
        localStorage['TCA-apDungTienCom'] = '0';
        alert('Không áp dụng tiền cơm!');
      }
    } else {
      alert('Giá trị nhập vào không hợp lệ!');
      suaTienCom();
    }
    setTimeout(layDuLieu, 500);
  }
}

function doiCoChu() {
  const size = prompt(`•••  THAY ĐỔI CỠ CHỮ  •••\n\nLưu ý:  Cỡ chữ chỉ trong phạm vi từ 10 - 20`, localStorage['TCA-coChu'] != null ? localStorage['TCA-coChu'] : 14);
  if (size != null) {
    if (!isNaN(size) && parseInt(size) >= 10 && parseInt(size) <= 20) {
      if (size != localStorage['TCA-coChu']) {
        setTimeout(() => setFontSize(size), 200);
        localStorage['TCA-coChu'] = size;
      }
    } else {
      alert('Lưu ý:  Cỡ chữ chỉ trong phạm vi từ 10 - 20');
      doiCoChu();
    }
  }
}

function saoLuuDuLieu() {
  if (localStorage[`TCA-${nam}`] != null) {
    const check = confirm(`•••  SAO LƯU DỮ LIỆU  •••\n\nHệ thống sẽ tạo một bản sao lưu bao gồm tất cả dữ liệu năm ${nam}\n\nKiểu sao lưu:  Tập tin tải về\nTên tập tin:  TangCa_${nam}\nĐịnh dạng:  Json\n\nNhấn OK để tải về bản sao lưu`);
    if (check) {
      const backupObj = {
        year: nam,
        data: JSON.parse(localStorage[`TCA-${nam}`]),
        lcb: localStorage['TCA-lcb'],
        coChu: localStorage['TCA-coChu'], // v0.7+
        tienCom: localStorage['TCA-tienCom'],
        apDungTienCom: localStorage['TCA-apDungTienCom'],
        duLieuCu1: localStorage[`TCA-duLieu${nam-1}`],
        duLieuCu2: localStorage[`TCA-duLieu${nam-2}`],
        duLieuCu3: localStorage[`TCA-duLieu${nam-3}`],
      };
      const file = new Blob([JSON.stringify(backupObj)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = `TangCa_${nam}.json`;
      a.click();
      URL.revokeObjectURL(a.href); // Giải phóng bộ nhớ
    }
  } else alert('Chưa có dữ liệu để sao lưu!');
}

let fileUpload;
$('#inputUpload').addEventListener('change', (e) => {
  fileUpload = e.target.files[0];
});

function khoiPhucDuLieu() {
  if (fileUpload != null) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        let restoreObj = JSON.parse(fr.result);
        // Kiểm tra năm trong tệp khôi phục
        if (restoreObj.year == nam) {
          // Khôi phục dữ liệu tăng ca năm nay
          data = restoreObj.data;
          localStorage[`TCA-${nam}`] = JSON.stringify(restoreObj.data);
          // Khôi phục các dữ liệu khác
          localStorage['TCA-lcb'] = restoreObj.lcb;
          if (restoreObj.coChu != null) // v0.7+
            localStorage['TCA-coChu'] = restoreObj.coChu;
          localStorage['TCA-tienCom'] = restoreObj.tienCom;
          localStorage['TCA-apDungTienCom'] = restoreObj.apDungTienCom;
          // Khôi phục dữ liệu tăng ca cũ
          if (restoreObj.duLieuCu1 != null)
            localStorage[`TCA-duLieu${nam-1}`] = restoreObj.duLieuCu1;
          if (restoreObj.duLieuCu2 != null)
            localStorage[`TCA-duLieu${nam-2}`] = restoreObj.duLieuCu2;
          if (restoreObj.duLieuCu3 != null)
            localStorage[`TCA-duLieu${nam-3}`] = restoreObj.duLieuCu3;
          /*if (restoreObj.year + 1 == nam) {
            if (restoreObj.duLieuCu1 != null)
              localStorage[`TCA-duLieu${nam-2}`] = restoreObj.duLieuCu1;
            if (restoreObj.duLieuCu2 != null)
              localStorage[`TCA-duLieu${nam-3}`] = restoreObj.duLieuCu2;
          }
          else if (restoreObj.year + 2 == nam) {
            if (restoreObj.duLieuCu1 != null)
              localStorage[`TCA-duLieu${nam-3}`] = restoreObj.duLieuCu1;
          }*/
          $('#divUpload').style.display = 'none';
          alert('Khôi phục thành công!');
          setTimeout(() => location.reload(), 500);
          /*setFontSize(restoreObj.coChu);
          $('#divUpload').style.display = 'none';
          $('#inputUpload').value = null;
          fileUpload = null;
          setTimeout(layDuLieu, 500);*/
        } else alert(`•••  THÔNG BÁO HỆ THỐNG  •••\n\nTệp khôi phục này là năm ${restoreObj.year}\nHãy chọn lại tệp khôi phục năm ${nam}`);
      }
      catch (error) {
        alert(`•••  SỰ CỐ KHÔI PHỤC  •••\n\nTệp khôi phục này chứa dữ liệu không hợp lệ hoặc đã bị thay đổi, chỉnh sửa!\n\nChi tiết mã sự cố:\n${error}`);
      }
    }
    fr.readAsText(fileUpload);
  } else alert('Hãy chọn tệp khôi phục trước!');
}

function tinhTien(num) {
  return Intl.NumberFormat().format(Math.floor(num));
}

function tuyChonKhac() {
  const check = prompt(`•••  TÙY CHỌN KHÁC  •••\n
1. Xoá dữ liệu tháng này
2. Xoá tất cả dữ liệu
3. Nhật ký phiên bản
\nChọn một giá trị số tương ứng:`);
  if (check != null && check.trim().length > 0) {
    if (check == '1') {
      if (prompt(`•••  THÔNG BÁO HỆ THỐNG  •••\n\nDữ liệu tháng ${thang} sẽ bị xoá\n\nNhập 123 nhấn OK để xác nhận`) == '123') {
        data[thang] = {};
        localStorage[`TCA-${nam}`] = JSON.stringify(data);
        alert(`Đã xoá dữ liệu tháng ${thang}!`)
        setTimeout(layDuLieu, 500);
      } else alert('Giá trị nhập không hợp lệ!');
    }
    else if (check == '2') {
      if (prompt(`•••  THÔNG BÁO HỆ THỐNG  •••\n\nTất cả dữ liệu tăng ca sẽ bị xoá\n\nNhập 123 nhấn OK để xác nhận`) == '123') {
        data = {
          [thang]: {}
        }
        localStorage.removeItem(nam);
        alert('Đã xoá tất cả dữ liệu tăng ca!');
        setTimeout(layDuLieu, 500);
      } else alert('Giá trị nhập không hợp lệ!');
    }
    else if (check == '3')
      setTimeout(nhatKyPhienBan, 200);
    else if (check != null) {
      alert('Lựa chọn không hợp lệ!');
      tuyChonKhac();
    }
  }
}

function nhatKyPhienBan() {
  const text = `${phienBan} ${ngayCapNhat}${noiDungCapNhat}\n
0.7 (12.11.2023)
- Tối ưu hoá ứng dụng, mã nguồn\n
0.6 (10.11.2023)
- Chốt ngày tăng ca tự động\n
0.5 (24.08.2023)
- Thêm tính năng: "Sao Lưu Dữ Liệu", "Khôi Phục Dữ Liệu"\n
0.4 (21.08.2023)
- Đơn giản hoá giao diện người dùng\n
0.3 (19.08.2023)
- Thêm tính năng: "Thay Đổi Cỡ Chữ"\n
0.2 (07.08.2023)
- Hỗ trợ sử dụng ngoại tuyến\n
0.1 (06.08.2023)
- Bản thử nghiệm đầu tiên`;
  popUpThongBao(text);
}

// Xem thông báo phiên bản khi click vào thẻ p (id: vs)
$('#version').onclick = () => setTimeout(nhatKyPhienBan, 200);