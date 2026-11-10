# Auto Type E-Typing

Script JavaScript chạy trong DevTools Console để tự động gõ trên [e-typing.ne.jp](https://www.e-typing.ne.jp/).

## Cách dùng

1. Mở một bài luyện gõ trên e-typing.
2. Nhấn **F12**, chuyển sang tab **Console**. Nếu app nằm trong iframe, đổi dropdown `top` sang iframe của app.
3. Dán toàn bộ nội dung `etyping-autotype.js` rồi nhấn Enter.
4. Gõ `etStop()` trong Console để dừng.

## Cách hoạt động

- Đọc `#kanaText` và tự chuyển cả câu kana sang romaji (hiragana/katakana, âm ghép, `っ`, `ん`, `ー`).
- Đọc `#sentenceText`: phần `span.entered` là romaji đã gõ, phần còn lại là romaji app hiển thị.
- Ở đầu câu app chưa hiện romaji, nên script dùng romaji tự tính; khi app đã hiện thì ưu tiên romaji của app.
- Gõ từng ký tự bằng `keydown`, `keypress`, `keyup`, chờ app ghi nhận rồi mới gõ tiếp để tránh gõ trùng.

## Tuỳ chỉnh

Trong `etyping-autotype.js`:

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `DELAY` | 50 | ms giữa các phím |
| `SENTENCE_PAUSE` | 300 | ms nghỉ khi sang câu mới |
| `MAX_WAIT` | 1500 | ms tối đa chờ app nhận phím |
| `DEBUG` | false | log từng bước ra Console |

## Chẩn đoán

Nếu bị gõ sai: chạy `etyping-diag.js` trước, rồi chạy `etyping-autotype.js`, đợi vài câu, gõ `etStop()` rồi `etDump()`. Kết quả (HTML vùng gõ và log DOM/phím) được copy vào clipboard.

## Lưu ý

Chỉ dùng cho mục đích học tập/thử nghiệm. Dùng auto type có thể vi phạm điều khoản của e-typing và làm sai lệch bảng xếp hạng.
