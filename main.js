// Kiểm tra nếu có SW mới và đã từng sử dụng thì reload lại trang
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.oncontrollerchange = () => {
    if (localStorage['TCA-lcb'] != null)
      location.reload();
  }
} else console.log('Trình duyệt này không hỗ trợ Service Worker!');

// Phiên bản ứng dụng
const phienBan = '1.0.2';
const ngayCapNhat = '(24.12.2024)';
// Nội dung cập nhật
const noiDungCapNhat = `
- Cập nhật một vài tính năng hệ thống`;

// Các biến khởi tạo ban đầu
const $ = document.querySelector.bind(document); // Viết ngắn gọn của hàm querySelector
$('#version').innerText = `Phiên bản ${phienBan}`;
const today = new Date();
$('#tuyChon')[2].innerText += ` ${today.getFullYear()}`;
$('#chonNgay').value = `${today.getFullYear()}-${('0' + (today.getMonth() + 1)).slice(-2)}-${('0' + today.getDate()).slice(-2)}`;
const chonThang = $('#chonThang');
chonThang.value = today.getMonth() + 1;
const tbody = $('table>tbody');
const nam = today.getFullYear();
const thu = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
let thang = chonThang.value;
let tenThu = thu[today.getDay()];
let ngay = today.getDate();
let data; // Dữ liệu tăng (Main data)
const phanTramTC = localStorage['TCA-phanTramTc'] != null ? JSON.parse(localStorage['TCA-phanTramTc']) : { ngay: 1.5, dem: 2.15 }; // Tăng ca ngày 150%, ca đêm 215%
let loaiTcGanDay = localStorage['TCA-loaiTcGanDay'] != null ? localStorage['TCA-loaiTcGanDay'] : 'ngày'; // Ngày, đêm
let ngayTrongThang = localStorage['TCA-ngayTrongThang'] != null ? parseInt(localStorage['TCA-ngayTrongThang']) : 0; // Mặc định 0, chia số ngày trong tháng trừ chủ nhật
let debug = false; // Gỡ lỗi, xem đầy đủ dữ liệu bao gồm lcb, phần trăm tăng ca, tiền cơm khi hiển thị

(function appStart() {
  // Thông báo nếu có phiên bản mới
  if (localStorage['TCA-phienBan'] == null)
    localStorage['TCA-phienBan'] = phienBan;
  else if (phienBan != localStorage['TCA-phienBan']) {
    const oldVer = localStorage['TCA-phienBan'];
    localStorage['TCA-phienBan'] = phienBan;
    setTimeout(() => alert(`•••  THÔNG BÁO CẬP NHẬT  •••\n\nĐã cập nhật phiên bản:  ${oldVer}  lên  ${phienBan}\n\nNội dung cập nhật bao gồm:${noiDungCapNhat}`), 200);
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
    if (data[thang] == null) // Nếu tháng hiện tại chưa có tạo một đối tượng rỗng để tránh lỗi
      data[thang] = {}
  }
  else { // Tạo mới dữ liệu
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
  3. Tất cả dữ liệu người dùng được lưu cố định trên trình duyệt Web này, nếu sử dụng một trình duyệt Web khác hoặc tab riêng tư để truy cập sẽ không tìm thấy dữ liệu đã được lưu trước đó`), 1000);
  }

  // Cỡ chữ ban đầu
  setFontSize(localStorage['TCA-coChu']);

  // Ẩn các tháng lớn hơn tháng hiện tại
  for (let i = thang; i < 12; i++) {
    chonThang[i].disabled = true;
  }

  // Hiển thị lương cơ bản của thẻ th trong tbody
  $('#thLcb').innerText = `Lương cơ bản: ${localStorage['TCA-lcb'] != null ? tinhTien(parseInt(localStorage['TCA-lcb'])) + ' đ' : 'Chưa có'}`;

  setTimeout(layDuLieu);
})();

// Hàm kiểm tra dữ liệu cũ khi sang năm tiếp theo
function kiemTraLuuDuLieu(kiemTra = false) {
  if (kiemTra) {
    for (let i = nam - 1; i > nam - 4; i--) {
      if (`TCA-${i}` in localStorage)
        return i;
    }
  } else return nam;
}

function setFontSize(sizes = 14) {
  const size = sizes + 'px';
  $('*').style.fontSize = size;
  $('#chonThang').style.fontSize = size;
  $('#chonNgay').style.fontSize = size;
  $('#tuyChon').style.fontSize = size;
  // Div thêm dữ liệu
  $('#inputThemDuLieu').style.fontSize = size;
  $('#btnThoatThemDuLieu').style.fontSize = size;
  $('#btnThemDuLieu').style.fontSize = size;
  // Upload khôi phục
  $('#inputUpload').style.fontSize = size;
  $('#btnThoatKhoiPhuc').style.fontSize = size;
  $('#btnKhoiPhuc').style.fontSize = size;
  $('#btnThoatThongBao').style.fontSize = size;
  // Cài đặt
  $('#inputCoChu').style.fontSize = size;
  $('#inputTienCom').style.fontSize = size;
  $('#inputTcNgay').style.fontSize = size;
  $('#inputTcDem').style.fontSize = size;
  $('#inputNgayTrongThang').style.fontSize = size;
  $('#btnThoatCaiDat').style.fontSize = size;
  $('#btnLuuCaiDat').style.fontSize = size;
  // Btn thêm dữ liệu
  $('#btnThem').style.fontSize = size;
}

// Hàm hiện thông báo
function popUpThongBao(text) {
  document.body.style.overflow = 'hidden';
  $('#divThongBao').style.display = 'block';
  $('#textThongBao').innerText = text;
}

function thayDoiThang() {
  thang = chonThang.value;
  $('#chonNgay').value = `${today.getFullYear()}-${('0' + thang).slice(-2)}-${thang == (today.getMonth() + 1) ? ('0' + today.getDate()).slice(-2) : '01'}`;
  const date = new Date($('#chonNgay').value);
  tenThu = thu[date.getDay()];
  ngay = date.getDate();
  if (data[thang] == null)
    data[thang] = {};
  setTimeout(layDuLieu);
}

function thayDoiNgay(e) {
  const todays = new Date(e.target.value);
  tenThu = thu[todays.getDay()];
  ngay = todays.getDate();
  $('#thuNgay').innerText = `${tenThu} • Ngày ${ngay}`;
}

async function menuTuyChon() {
  const tc = $('#tuyChon');
  if (tc.value == 'thongKeThangNay') setTimeout(thongKeThang);
  else if (tc.value == 'thongKe') setTimeout(thongKeNam);
  else if (tc.value == 'duLieuDaLuu') duLieuDaLuu();
  else if (tc.value == 'saoLuuDuLieu') saoLuuDuLieu();
  else if (tc.value == 'khoiPhucDuLieu') {
    if (confirm(`•••  KHÔI PHỤC DỮ LIỆU  •••\n\nLưu ý:  Tất cả dữ liệu hiện tại sẽ được thay thế bằng dữ liệu trong tệp khôi phục và tệp dữ liệu khôi phục phải là năm ${nam}\n\nNhấn OK và chọn tệp khôi phục`))
      setTimeout(() => $('#divUpload').style.display = 'block', 200);
  }
  else if (tc.value == 'caiDat') {
    // Hiển thị các giá trị trong Div cài đặt
    $('#thuNgay').innerText = `${tenThu} • Ngày ${ngay}`;
    $('#inputCoChu').value = localStorage['TCA-coChu'];
    $('#inputTienCom').value = localStorage['TCA-apDungTienCom'] == '1' ? localStorage['TCA-tienCom'] : null;
    $('#lableTcNgay').innerHTML = `Tăng ca ngày (${phanTramTC.ngay * 100}%)`;
    $('#lableTcDem').innerHTML = `Tăng ca đêm (${phanTramTC.dem * 100}%)`;
    $('#inputTcNgay').value = phanTramTC.ngay;
    $('#inputTcDem').value = phanTramTC.dem;
    const ngayTrogThag = $('#inputNgayTrongThang');
    if (ngayTrongThang > 0)
      ngayTrogThag.value = ngayTrongThang;
    else {
      ngayTrogThag.value = null;
      ngayTrogThag.placeholder = `Chia cho ${countDaysOfMonth(thang, nam)} ngày`;
    }
    setTimeout(() => $('#divCaiDat').style.display = 'block', 150);
  }
  else if (tc.value == 'tinhNangKhac') tinhNangKhac();
  else if (tc.value == 'chiaSe') {
    const shareData = {
      title: 'Chia sẽ web tăng ca',
      //text: 'Chia sẽ trang Web tăng ca để bạn bè cùng sử dụng',
      url: 'https://pmi-pro.github.io/TangCa',
      //files: [] // Chia sẽ các tệp với đối tượng File
    };
    try { await navigator.share(shareData); } catch {}
  }
  else if (tc.value == 'nhatKyPhienBan') setTimeout(nhatKyPhienBan, 50);
  else if (tc.value == 'thongTin') alert(`•••  THÔNG TIN WEB TĂNG CA  •••\n\nPhiên bản:  ${phienBan} ${ngayCapNhat}\n\nTác giả:  Nguyễn Phương Minh\n\nHỗ trợ, góp ý:  0969.442.210 (Có Zalo)`);
  tc.value = 'menu';
}

// Hàm đếm số ngày trong tháng trừ chủ nhật (hoặc thứ bảy tùy chọn)
function countDaysOfMonth(month, year, countSaturday = true) {
  // Lấy số ngày trong tháng
  const daysInMonth = new Date(year, month, 0).getDate();
  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day); // month - 1 vì JS đếm tháng từ 0-11
    const dayOfWeek = date.getDay();
    // Đếm ngày không phải Chủ Nhật
    if (dayOfWeek !== 0 && (countSaturday || dayOfWeek !== 6)) {
      count++;
    }
  }
  if (count > 26) count = 26; // Nếu số ngày đếm được lớn hơn 26, thì bằng 26
  return count;
}

// Hàm Kiểm tra chốt ngày tăng ca
function chotNgayTC() {
  for (let i = 16; i <= 31; i++) { // Kiểm tra xem có các ngày lớn hơn 15 trở đi không
    if (data[thang][i] == null) continue;
    for (let j = 15; j >= 1; j--) { // Tiếp tục kiểm tra các ngày từ 15 trở về (nếu đã có các ngày lớn hơn 15)
      if (data[thang][j] == null) continue;
      return j; // Trả về ngày tìm được và thoát khỏi vòng lặp, hàm
    }
  }
  return 0; // Trả về 0 nếu không tồn tại các thuộc tính 1-15 (không có các ngày 1-15)
}

// Kiểm tra thời gian trong phạm vi tính tiền cơm
function kiemTraTinhTienCom(thoiGian) {
  if (thoiGian <= 2.5)
    return true;
  return false;
}

function layDuLieu() {
  const chotNgayTangCa = chotNgayTC();
  const dayOfMonth = countDaysOfMonth(thang, nam);
  const apDungTienCom = localStorage['TCA-apDungTienCom'];
  tbody.innerHTML = null;
  let ngay = 0,
    gio = 0,
    tien = 0,
    chotNgay = 0,
    chotGio = 0,
    chotTien = 0;
  for (const [key, obj] of Object.entries(data[thang])) {
    ngay++;
    gio += obj.gtc;
    const com = apDungTienCom == '1' && obj.loaiTc.tg == 'ngày' && kiemTraTinhTienCom(obj.gtc) ? obj.com : 0;
    tien += obj.lcb / dayOfMonth / 8 * obj.loaiTc.pt * obj.gtc + com;

    tbody.innerHTML += `
      <tr>
        <td onclick='setTimeout(() => suaDuLieu(${key}), 100);'>${obj.thoiGian}${obj.loaiTc.tg != 'ngày' ? ' • (Đêm)' : ''}${debug ? `<br><h5 style='margin: 2px; color: brown;'>Lcb: ${tinhTien(obj.lcb)} • Pt: ${obj.loaiTc.pt}</h5>` : ''}</td>
        <td onclick='xoaDuLieu(${key})'>${obj.gtc}${debug && com > 0 ? `<br><h5 style='margin: 2px; color: brown;'>Cơm: ${tinhTien(obj.com)}</h5>` : ''}</td>
      </tr>`;

    if (key == chotNgayTangCa) {
      tbody.innerHTML += `<td onclick="setTimeout(thongKeThang);" colspan=2 style='color: brown; font-weight: bold; background-color: aliceblue;'>Đợt 1 • ${ngay} ngày • ${gio} tiếng • ${tinhTien(tien)} đ</td>`;
      chotNgay = ngay;
      chotGio = gio;
      chotTien = tien;
    }
  }

  if (tbody.innerHTML != '') {
    $('#thGioTC').innerText = `${gio} tiếng • ${tinhTien(tien)} đ`;
    if (chotNgayTangCa > 0)
      tbody.innerHTML += `<td onclick="setTimeout(thongKeThang);" colspan=2 style='color: brown; font-weight: bold; background-color: aliceblue;'>Đợt 2 • ${ngay - chotNgay} ngày • ${gio - chotGio} tiếng • ${tinhTien(tien - chotTien)} đ</td>`;
  }
  else {
    $('#thGioTC').innerText = `0 tiếng`;
    tbody.innerHTML = `<td onclick='setTimeout(themDuLieu, 100);' colspan='2'>Tháng ${thang} chưa có dữ liệu</td>`;
    setTimeout(() => {
      if (localStorage['TCA-lcb'] == null)
        alert('Gợi ý:  Nhấn vào mục "Lương cơ bản" (màu xanh lá cây), để thêm lương cơ bản trước khi sử dụng!');
      else if (ngay == 0 && thang == today.getMonth() + 1)
        alert('Gợi ý:  Nhấn vào mục "Thêm dữ liệu" ở bên dưới để thêm giờ tăng ca!');
    }, 2000);
  }
}

function themDuLieu() { // Nút thêm dữ liệu trang chính
  if (localStorage['TCA-lcb'] != null) {
    if (data[thang][ngay] == null) {
      $('#tieuDeThemDuLieu').innerText = 'THÊM DỮ LIỆU';
      $('#thuNgay').innerText = `${tenThu} • Ngày ${ngay}`;
      $('#inputThemDuLieu').value = localStorage['TCA-gtcGanDay'] != null ? localStorage['TCA-gtcGanDay'] : 1.5;
      if (loaiTcGanDay == 'ngày') $('#radioTcNgay').click();
      else $('#radioTcDem').click();
      $('#btnThemDuLieu').innerText = 'Thêm';
      $('#divThemDuLieu').style.display = 'block';
    }
    else {
      const obj = data[thang][ngay];
      alert(`Dữ liệu đã có:\n\n${tenThu} • Ngày ${ngay}:  ${obj.gtc}  tiếng${obj.loaiTc.tg == 'ngày' ? '' : ' (Đêm)'}`);
    }
  }
  else { // Yêu cầu lương cơ bản
    const lcb = prompt('•••  THÔNG BÁO HỆ THỐNG  •••\n\nHệ thống yêu cầu có lương cơ bản để tính toán tiền tăng ca, vui lòng nhập lương cơ bản trước khi sử dụng (bắt buộc)\n\nLưu ý:  Hãy nhập đúng lương cơ bản, nếu nhập sai khi thêm dữ liệu hệ thống tính toán, thống kê tiền tăng ca sẽ bị sai\n\nGợi ý:  Sửa lại và nhấn OK để tiếp tục', 6647500);
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
        suaLuongCB();
      }
    }
  }
}

let obj; // Biến tạm lưu địa chỉ đối tượng để chỉnh sửa
function btnDivThemDuLieu() {
  const value = $('#inputThemDuLieu').value;
  if ($('#btnThemDuLieu').innerText == 'Thêm') {
    if (!isNaN(value) && parseFloat(value) > 0) {
      const tg = loaiTcGanDay;
      const pt = tg == 'ngày' ? phanTramTC.ngay : phanTramTC.dem;
      data[thang][ngay] = { thoiGian: `${tenThu} • Ngày ${ngay}`, gtc: parseFloat(value), lcb: parseInt(localStorage['TCA-lcb']), com: parseInt(localStorage['TCA-tienCom']), loaiTc: { pt: pt, tg: tg } };
      $('#divThemDuLieu').style.display = 'none';
      setTimeout(layDuLieu, 200);
      localStorage[`TCA-${nam}`] = JSON.stringify(data);
      if (value != localStorage['TCA-gtcGanDay'])
        localStorage['TCA-gtcGanDay'] = value;
      if (tg != localStorage['TCA-loaiTcGanDay'])
        localStorage['TCA-loaiTcGanDay'] = tg;
    } else alert('Giá trị giờ tăng ca không hợp lệ');
  }
  else { // Cập nhật
    const val = value.split('=');
    const valLowerCase = val[0].toLowerCase();
    if (obj.gtc == value && obj.loaiTc.tg == loaiTcGanDay)
      return alert(`Hãy thay đổi dữ liệu trước khi cập nhật!`);
    else if (value.toLowerCase() == 'pmi') {
      debug = true;
      $('#divThemDuLieu').style.display = 'none';
      alert('Đã bật chế độ gỡ lỗi!');
      setTimeout(layDuLieu, 500);
      return;
    }
    else if (debug && valLowerCase == 'lcb' && !isNaN(val[1]) && parseInt(val[1]) > 0) {
      if (val[1] != obj.lcb) {
        obj.lcb = parseInt(val[1]);
        alert(`Đã cập nhật lương cơ bản!\n\n${obj.thoiGian}:  ${tinhTien(obj.lcb)} đ`);
      } else return alert('Lương cơ bản bị trùng!');
    }
    else if (debug && valLowerCase == 'pt' && !isNaN(val[1]) && parseFloat(val[1]) > 0) {
      if (val[1] != obj.loaiTc.pt) {
        obj.loaiTc.pt = parseFloat(val[1]);
        alert(`Đã cập nhật phần trăm tăng ca!\n\n${obj.thoiGian}:  ${obj.loaiTc.pt}`);
      } else return alert('Phần trăm tăng ca bị trùng!');
    }
    else if (debug && localStorage['TCA-apDungTienCom'] == '1' && obj.gtc == 1.5 && valLowerCase == 'com' && !isNaN(val[1]) && parseInt(val[1]) > 0) {
      if (val[1] != obj.com) {
        obj.com = parseInt(val[1]);
        alert(`Đã cập nhật tiền cơm!\n\n${obj.thoiGian}:  ${tinhTien(obj.com)} đ`);
      } else return alert('Tiền cơm bị trùng!');
    }
    else if (!isNaN(value) && parseFloat(value) > 0) {
      if (obj.gtc != value) {
        obj.gtc = parseFloat(value);
        alert(`Đã cập nhật giờ tăng ca!\n\n${obj.thoiGian}:  ${obj.gtc}  tiếng`);
      }
    }
    else if (parseFloat(value) <= 0 || isNaN(value) || value.trim().length == 0)
      return alert('Giá trị cập nhật không hợp lệ!');

    // Cập nhật loại tăng ca (Ngày, đêm)
    if (valLowerCase != 'pt' && obj.loaiTc.tg != loaiTcGanDay) {
      if (loaiTcGanDay == 'ngày') obj.loaiTc.pt = phanTramTC.ngay;
      else obj.loaiTc.pt = phanTramTC.dem;
      obj.loaiTc.tg = loaiTcGanDay;
    }
    $('#divThemDuLieu').style.display = 'none';
    setTimeout(layDuLieu, 500);
    localStorage[`TCA-${nam}`] = JSON.stringify(data);
  }
}

function suaDuLieu(key) {
  obj = data[thang][key];
  $('#tieuDeThemDuLieu').innerText = 'SỬA DỮ LIỆU';
  $('#thuNgay').innerText = obj.thoiGian;
  const value = $('#inputThemDuLieu');
  value.value = obj.gtc;
  if (obj.loaiTc.tg == 'ngày') $('#radioTcNgay').click();
  else $('#radioTcDem').click();
  $('#btnThemDuLieu').innerText = 'Cập nhật'
  $('#divThemDuLieu').style.display = 'block';
}

function xoaDuLieu(key) {
  const obj = data[thang][key];
  if (confirm(`•••  XOÁ DỮ LIỆU  •••\n\n${obj.thoiGian}:  ${obj.gtc}  tiếng${obj.loaiTc.tg == 'ngày' ? '' : ' (Đêm)'}\n\nNhấn OK để xoá`)) {
    alert(`Đã xoá:  ${obj.thoiGian}`);
    delete data[thang][key];
    setTimeout(layDuLieu, 500);
    localStorage[`TCA-${nam}`] = JSON.stringify(data);
  }
}

function thongKeThang() {
  const dayOfMonth = countDaysOfMonth(thang, nam);
  const apDungTienCom = localStorage['TCA-apDungTienCom'];
  let ngay = 0,
    gio = 0,
    tien = 0,
    com = 0;
  for (const day in data[thang]) {
    const obj = data[thang][day];
    ngay++;
    gio += obj.gtc;
    com += apDungTienCom == '1' && obj.loaiTc.tg == 'ngày' && kiemTraTinhTienCom(obj.gtc) ? obj.com : 0;
    tien += obj.lcb / dayOfMonth / 8 * obj.loaiTc.pt * obj.gtc;
  }

  if (ngay == 0) return alert('Tháng này chưa có dữ liệu!');

  alert(`•••  THỐNG KÊ THÁNG ${thang}  •••\n
Tổng ngày t.ca:  ${ngay}  ngày\n
Tổng giờ t.ca:     ${gio}  tiếng
${com > 0 ? `\n----------\n
Tiền t.ca:            ${tinhTien(tien)} đ\n
Tiền cơm:           ${tinhTien(com)} đ\n` : ''}
Thành tiền:         ${tinhTien(tien + com)} đ`);
}

function thongKeNam(luuDuLieu = false) {
  const year = kiemTraLuuDuLieu(luuDuLieu);
  let result = `${!luuDuLieu ? 'THỐNG KÊ' : 'DỮ LIỆU'} TĂNG CA ${year}\n----------\n`;
  const apDungTienCom = localStorage['TCA-apDungTienCom'];
  let tongNgay = 0,
    tongGtc = 0,
    tongTien = 0,
    tongCom = 0;
  for (let i = 1; i <= 12; i++) {
    if (data[i] == null) continue;
    const dayOfMonth = countDaysOfMonth(i, year);
    let ngay = 0,
      gio = 0,
      tien = 0,
      com = 0;
    for (const day in data[i]) {
      const obj = data[i][day];
      tongNgay++;
      ngay++;
      gio += obj.gtc;
      com += apDungTienCom == '1' && obj.loaiTc.tg == 'ngày' && kiemTraTinhTienCom(obj.gtc) ? obj.com : 0;
      tien += obj.lcb / dayOfMonth / 8 * obj.loaiTc.pt * obj.gtc;
    }
    //result += `Th ${i >= 10 ? i : '0' + i}:  ${ngay > 0 ? `${ngay} ngày  •  ${gio} tiếng  •  ${tinhTien(tien + com)} đ\n` : '\n'}`;
    tongGtc += gio;
    tongTien += tien;
    tongCom += com;
    if (ngay > 0) // Tháng nào có ngày làm mới hiển thị
      result += `Th ${i >= 10 ? i : '0' + i}:  ${ngay} ngày  •  ${gio} tiếng  •  ${tinhTien(tien + com)} đ\n`;
  }

  if (tongNgay == 0) return alert('Năm hiện tại chưa có dữ liệu!');

  result += `----------
Tổng ngày:  ${tongNgay}  ngày
Tổng giờ:     ${tongGtc}  tiếng
Tổng tiền:    ${tinhTien(tongTien + tongCom)} đ`;

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
  const lcb = prompt('•••  THAY ĐỔI LƯƠNG CƠ BẢN  •••\n\nLưu ý:  Hãy nhập đúng lương cơ bản, nếu nhập sai khi thêm dữ liệu hệ thống tính toán, thống kê tiền tăng ca sẽ bị sai\n\nGợi ý:  Sửa lại và nhấn OK để tiếp tục', `${localStorage['TCA-lcb'] == null ? 6647500 : localStorage['TCA-lcb']}`);
  if (lcb != null) {
    if (!isNaN(lcb) && parseInt(lcb) > 0) {
      if (confirm(`Lương cơ bản vừa nhập là:  ${tinhTien(parseInt(lcb))} đ\n\nNhấn OK để xác nhận`)) {
        alert(`Lương cơ bản mới là:  ${tinhTien(parseInt(lcb))} đ`);
        $('#thLcb').innerText = `Lương cơ bản: ${tinhTien(parseInt(lcb))} đ`;
        localStorage['TCA-lcb'] = lcb;
        const month = today.getMonth() + 1;
        // Cập nhật lại lcb mới cho các ngày trong tháng
        if (Object.entries(data[month]).length > 0) {
          const newLcb = parseInt(lcb);
          for (const day in data[month]) {
            data[month][day].lcb = newLcb;
          }
          setTimeout(layDuLieu, 500);
          localStorage[`TCA-${nam}`] = JSON.stringify(data);
        }
      }
    } else {
      alert('Lưu ý:  Giá trị phải là số và lớn hơn 0');
      suaLuongCB();
    }
  }
}

// Sao lưu, khôi phục
function saoLuuDuLieu() {
  if (localStorage[`TCA-${nam}`] != null) {
    const check = confirm(`•••  SAO LƯU DỮ LIỆU  •••\n\nHệ thống sẽ tạo một bản sao lưu bao gồm tất cả dữ liệu năm ${nam}\n\nKiểu sao lưu:  Tệp tin tải về\nTên tệp tin:  TangCa_${nam}\nĐịnh dạng:  Json\n\nNhấn OK để tiếp tục`);
    if (check) {
      const backupObj = {
        year: nam,
        data: data,
        coChu: localStorage['TCA-coChu'],
        lcb: localStorage['TCA-lcb'],
        phanTramTc: phanTramTC,
        ngayTrongThang: ngayTrongThang,
        gtcGanDay: localStorage['TCA-gtcGanDay'],
        loaiTcGanDay: loaiTcGanDay,
        tienCom: localStorage['TCA-tienCom'],
        apDungTienCom: localStorage['TCA-apDungTienCom'],
        duLieuCu1: localStorage[`TCA-duLieu${nam-1}`],
        duLieuCu2: localStorage[`TCA-duLieu${nam-2}`],
        duLieuCu3: localStorage[`TCA-duLieu${nam-3}`],
      };

      const file = new Blob([JSON.stringify(backupObj)], { type: 'application/json' });
      const a = document.createElement('a'); // Tạo một thẻ A
      a.href = URL.createObjectURL(file); // Tạo URL cho đối tượng Blob
      a.download = `TangCa_${nam}.json`; // Tên file tải xuống
      a.click(); // Gọi phương thức Click để yêu cầu tải xuống
      URL.revokeObjectURL(a.href); // Giải phóng bộ nhớ
    }
  } else alert('Chưa có dữ liệu để sao lưu!');
}

let fileUpload; // Biến lưu giữ dữ liệu từ file up lên
$('#inputUpload').addEventListener('change', (e) => {
  fileUpload = e.target.files[0];
});

function khoiPhucDuLieu() {
  if (fileUpload != null) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        let restoreObj = JSON.parse(fr.result);
        if (restoreObj.year == nam) { // Kiểm tra năm trong tệp khôi phục
          data = restoreObj.data; // Khôi phục dữ liệu tăng ca năm nay
          localStorage[`TCA-${nam}`] = JSON.stringify(restoreObj.data);
          // Khôi phục các dữ liệu khác
          localStorage['TCA-coChu'] = restoreObj.coChu;
          localStorage['TCA-lcb'] = restoreObj.lcb;
          localStorage['TCA-phanTramTc'] = JSON.stringify(restoreObj.phanTramTc);
          localStorage['TCA-ngayTrongThang'] = restoreObj.ngayTrongThang;
          localStorage['TCA-gtcGanDay'] = restoreObj.gtcGanDay;
          localStorage['TCA-loaiTcGanDay'] = restoreObj.loaiTcGanDay;
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
        alert(`•••  SỰ CỐ KHÔI PHỤC  •••\n\nTệp khôi phục chứa dữ liệu không hợp lệ hoặc đã bị thay đổi, chỉnh sửa!\n\nChi tiết mã sự cố:\n${error}`);
      }
    }
    fr.readAsText(fileUpload);
  } else alert(`Tệp chưa được chọn!\n\nHãy chọn tệp "TangCa_${nam}.json" trước, sau đó nhấn chọn "Khôi phục"`);
}

function tinhTien(num) {
  return Intl.NumberFormat().format(Math.floor(num));
}

function radioTcClick(value) {
  loaiTcGanDay = value;
}

function luuCaiDat() {
  const coChu = $('#inputCoChu');
  const tcNgay = $('#inputTcNgay');
  const tcDem = $('#inputTcDem');
  const ngayTrogThag = $('#inputNgayTrongThang');
  const tienCom = $('#inputTienCom');
  let isChange = false;

  if (!isNaN(coChu.value) && parseInt(coChu.value) >= 10 && parseInt(coChu.value) <= 20) {
    if (coChu.value != localStorage['TCA-coChu']) {
      setTimeout(() => setFontSize(coChu.value), 200);
      localStorage['TCA-coChu'] = coChu.value;
    }
  } else return alert('Cỡ chữ chỉ trong phạm vi từ 10 - 20');

  if (!isNaN(tcNgay.value) && parseFloat(tcNgay.value) > 0) {
    if (tcNgay.value != phanTramTC.ngay) {
      phanTramTC.ngay = parseFloat(tcNgay.value);
      localStorage['TCA-phanTramTc'] = JSON.stringify({ ngay: parseFloat(tcNgay.value), dem: phanTramTC.dem });
      const month = today.getMonth() + 1;
      if (Object.entries(data[month]).length > 0) {
        for (const day in data[month]) {
          if (data[month][day].loaiTc.tg == 'ngày')
            data[month][day].loaiTc.pt = phanTramTC.ngay;
        }
      }
      isChange = true;
    }
  } else return alert('Giá trị phần trăm tăng ca ngày không hợp lệ!');

  if (!isNaN(tcDem.value) && parseFloat(tcDem.value) > 0) {
    if (tcDem.value != phanTramTC.dem) {
      phanTramTC.dem = parseFloat(tcDem.value);
      localStorage['TCA-phanTramTc'] = JSON.stringify({ ngay: phanTramTC.ngay, dem: parseFloat(tcDem.value) });
      const month = today.getMonth() + 1;
      if (Object.entries(data[month]).length > 0) {
        for (const day in data[month]) {
          if (data[month][day].loaiTc.tg == 'đêm')
            data[month][day].loaiTc.pt = phanTramTC.dem;
        }
      }
      isChange = true;
    }
  } else return alert('Giá trị phần trăm tăng ca đêm không hợp lệ!');

  if (ngayTrogThag.value != ngayTrongThang) {
    if (ngayTrogThag.value == '') {
      ngayTrongThang = 0;
      localStorage['TCA-ngayTrongThang'] = '0';
    }
    else if (parseInt(ngayTrogThag.value) > 0 && parseInt(ngayTrogThag.value) < 32) {
      ngayTrongThang = parseInt(ngayTrogThag.value);
      localStorage['TCA-ngayTrongThang'] = ngayTrogThag.value;
    }
    else return alert('Giá trị số ngày trong tháng không hợp lệ!');
    isChange = true;
  }

  if (!isNaN(tienCom.value) && parseInt(tienCom.value) > 0) {
    if (tienCom.value != localStorage['TCA-tienCom']) {
      localStorage['TCA-tienCom'] = tienCom.value;
      const month = today.getMonth() + 1;
      if (Object.entries(data[month]).length > 0) {
        const newCom = parseInt(tienCom.value);
        for (const day in data[month]) {
          data[month][day].com = newCom;
        }
      }
      isChange = true;
    }
    else if (localStorage['TCA-apDungTienCom'] == '0') {
      localStorage['TCA-apDungTienCom'] = '1';
      isChange = true;
    }
  }
  else if (tienCom.value == '0' || tienCom.value == '') {
    if (tienCom.value != localStorage['TCA-tienCom']) {
      localStorage['TCA-apDungTienCom'] = '0';
      isChange = true;
    }
  } else return alert('Giá trị tiền cơm không hợp lệ!');

  if (isChange) {
    setTimeout(layDuLieu, 500);
    localStorage[`TCA-${nam}`] = JSON.stringify(data);
  }

  $('#divCaiDat').style.display = 'none';
}

/* Tính năng sắp triển khai
function tinhNangKhac() {
  const chon = prompt(`•••  TÍNH NĂNG KHÁC  •••\n\n1. Thêm Dữ Liệu Tùy Chọn\n2. Xoá Dữ Liệu Tháng Này`);
  if (chon != null) {
    alert(chon);
  }
}*/

async function nhatKyPhienBan() {
  const verText = await fetch('version.txt').then(v => v.text());
  setTimeout(() => popUpThongBao(`${phienBan} ${ngayCapNhat}${noiDungCapNhat}\n\n${verText}`), 100);
}

// Xem thông báo phiên bản khi click vào thẻ p (id: vs)
$('#version').onclick = () => setTimeout(nhatKyPhienBan, 50);