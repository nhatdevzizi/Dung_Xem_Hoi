# Dừng · Xem · Hỏi — web demo

Trò chơi mô phỏng giúp học sinh kiểm chứng thông tin qua lựa chọn. **Mọi nhân vật, tin nhắn, trường và tài liệu trong game đều là hư cấu.** Không cần tài khoản, cơ sở dữ liệu hoặc khóa API.

## Chạy và kiểm tra

Cần Node.js 20.19+ hoặc 22.12+ và npm:

```bash
npm install
npm run dev
npm run verify
npm run build
```

Mở địa chỉ Vite in ra trong terminal, thường là `http://localhost:5173/Dung_Xem_Hoi/`. Bản build tĩnh nằm trong `dist/`.

## Cách chơi

1. Chọn **Tiểu học (lớp 3–5)**, **THCS (lớp 6–9)** hoặc **THPT (lớp 10–12)**, rồi chọn một trong 12 tình huống của cấp đó. Mỗi màn cũng có một biến thể mẫu của lời đồn.
2. Đọc tin và chọn **Tin / Chưa chắc / Không tin**.
3. Chọn lý do gần với suy nghĩ của mình. Các lý do thay đổi theo lựa chọn **Tin / Chưa chắc / Không tin**; đổi lựa chọn ban đầu sẽ xóa lý do cũ.
4. Chọn điều muốn kiểm tra. Mỗi lần chọn, hệ thống mới mở một bằng chứng mô phỏng có người tạo, ngày và nội dung. Có thể xem thêm nguồn trước khi đi tiếp.
5. Chọn lại **Tin / Chưa chắc / Không tin**, rồi viết **một câu ngắn** giải thích điều khiến mình giữ hoặc đổi lựa chọn.
6. Xem nhãn **ĐÚNG / SAI** cho lựa chọn cuối, lời giải thích và hai câu hỏi gợi mở riêng của màn. Có thể thử lại hoặc chơi màn khác. **Góc giáo viên** cho biết đáp án, đường kiểm chứng và giới hạn của từng nguồn.

Ở màn **Thứ Hai có cần mang vở Văn?**, một người bạn nhớ cô dặn mang vở Văn từ thứ Hai tuần sau, nhưng nhóm lớp chưa có thông báo. Học sinh chọn câu cần hỏi, rồi mô phỏng **nhắn tin hỏi cô** hoặc **gọi điện hỏi cô**. Phản hồi trực tiếp được mở sau hành động đó; thông báo trên nhóm xuất hiện muộn hơn. Game không gửi tin nhắn hay thực hiện cuộc gọi thật.

Tiến trình lưu trong `localStorage` của trình duyệt. Nút **Xóa phiên** xóa tiến trình. App không thu thập danh tính, tin nhắn thật hoặc thông tin cá nhân.

## Dữ liệu và chấm điểm

- `src/scenarios.json` và `src/scenarios-extra.ts`: 12 tình huống THCS, mỗi màn có sáu nguồn.
- `src/level-scenarios.ts`: 12 tình huống Tiểu học với ba nguồn ngắn, và 12 tình huống THPT với bốn nguồn đa dạng.
- `src/catalog.ts`: ba cấp học và bộ lọc 12 tình huống theo cấp.
- `src/types.ts`: kiểu dữ liệu tình huống và phiên chơi.
- `src/logic.ts`: quy tắc mở bằng chứng, điều kiện qua bước, kiểm tra dữ liệu và chấm điểm.
- `scripts/verify.mjs`: unit test cho 36 màn, cấp học, độ dài nguồn Tiểu học, loại nguồn THPT, lý do theo nhận định, kết quả đúng/sai và nhánh nhắn/gọi cô.

Các màn THPT dùng **chính sách, quy chế, tổ chức, báo và nhân vật hư cấu**. Nguồn dạng video và ảnh hiện được trình bày bằng mô tả hoặc bản chép lời mô phỏng, không phải tệp video/ảnh thật. Trích điều khoản cũng là văn bản giả định của trò chơi, không dùng để tra cứu luật thật.

Kết luận đúng được so riêng với điểm kiểm chứng. Điểm 0–3 phản ánh số và vai trò nguồn đã mở cùng việc học sinh có giải thích bằng lời của mình hay không. Hai phản hồi từ cùng một cô giáo không được tính là hai nguồn độc lập. Đây là quy tắc minh bạch, không hiểu sâu nội dung câu học sinh viết; giáo viên nên trao đổi thêm về lập luận trong lớp. Không thấy thông báo **không đồng nghĩa** tin sai.

## Chế độ AI

Game dùng dữ liệu mẫu cố định và không gọi dịch vụ AI khi học sinh chơi. Qwen Local qua Ollama được dùng để đề xuất chủ đề theo độ tuổi và rà thiết kế phân cấp; các đề xuất được biên tập lại, kiểm tra tính nhất quán rồi cố định trong mã. Không có khóa hoặc endpoint AI trong mã client.

## Kiểm tra hiện tại

Chạy `npm run verify` và `npm run build` sau mỗi lần sửa nội dung. Bộ verify kiểm tra 12 màn cho từng cấp, các ID nguồn, điều kiện qua từng bước, lý do theo lựa chọn, chỉ mở nguồn được yêu cầu, chấm nhận định cuối và hai cách liên hệ cô.
