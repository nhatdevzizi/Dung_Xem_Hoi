# Dừng · Xem · Hỏi — web demo

Web demo chơi được về kiểm chứng thông tin. **Mọi bài đăng, nhân vật, trường, tổ chức và tài liệu trong game đều mô phỏng.** App không yêu cầu tài khoản, cơ sở dữ liệu hay khóa API.

## Chạy trên máy mới

Cần Node.js 20.19+ hoặc 22.12+ và npm. Trong thư mục này:

```bash
npm install
npm run dev
```

Mở địa chỉ Vite in ra trong terminal, thường là `http://localhost:5173/`. Tạo bản phát hành và xem thử:

```bash
npm run verify
npm run build
npm run preview
```

Thư mục `dist/` là bản build tĩnh. Không cần chạy máy chủ API cho chế độ mặc định.

## Cách chơi

1. Chọn một trong bốn tình huống hoặc chọn **Thử biến thể mẫu**. Biến thể là cách diễn đạt soạn sẵn của cùng tuyên bố, không làm đổi đáp án.
2. Ở bước **Dừng**, chọn hành động ban đầu và viết lý do.
3. Ở bước **Xem**, tìm/lọc 6 nguồn, mở tài liệu để đọc tác giả, ngày và nội dung, rồi ghi nguồn vào sổ tay. Có thể dùng gợi ý theo bậc ở mục **Hỏi**. Không cần mở hết nguồn.
4. Chọn kết luận, viện dẫn ít nhất một nguồn đã mở, giải thích bằng lời của mình, có thể nêu giới hạn bằng chứng và đổi hành động sau khi xem nguồn.
5. Xem phản hồi, thử lại hoặc chuyển màn. **Góc giáo viên** có mục tiêu, đáp án, đường kiểm chứng và vai trò từng nguồn.

Tiến trình được lưu trong `localStorage` của trình duyệt này. Nút **Xóa phiên** xóa tiến trình. App không lưu danh tính, tin nhắn thật hay thông tin cá nhân và không có bảng xếp hạng.

## Dữ liệu và chấm điểm

- `src/scenarios.json`: bốn tình huống, mỗi tình huống 6 nguồn, quy tắc bằng chứng, gợi ý, ghi chú giáo viên và hai biến thể mẫu.
- `src/types.ts`: cùng kiểu `Scenario`/`Source`/`EvidenceRule` cho dữ liệu mẫu và một bản nháp AI trong tương lai.
- `src/logic.ts`: kiểm tra dữ liệu và chấm điểm tách khỏi giao diện. Kết luận đúng được so riêng với chất lượng lập luận.

Quy tắc điểm 0–3 là một **heuristic minh bạch**: 0 khi chỉ đoán/dựa nguồn không đủ và không giải thích; 1 khi có dấu hiệu nhưng liên hệ chưa rõ; 2 khi dùng nguồn liên quan với lý do đủ rõ; 3 khi thêm nguồn độc lập, nêu giới hạn hoặc đổi quyết định chia sẻ có căn cứ. Hệ thống dùng vai trò nguồn, số ký tự và quan hệ dẫn nguồn để chấm; nó không thể hiểu sâu mọi câu văn. Giáo viên nên đọc lập luận của học sinh khi dùng trong lớp. Thời gian chơi và số lượt chia sẻ không tính điểm.

Đáp án màn học bổng là **chưa đủ bằng chứng**: các bài dẫn về cùng một tin nhắn, còn kênh quỹ chưa xác nhận **hoặc** phủ nhận đợt này. Không gửi thông tin cá nhân trước khi xác minh.

## Chế độ AI và giới hạn

Trong phiên bản này, game chạy **chế độ mẫu có sẵn**. Gợi ý và biến thể đã được biên tập trong dữ liệu. Giao diện ghi rõ **“Biến thể mẫu”** và **“AI tạo bản nháp: chưa cấu hình phía máy chủ”**. Không có yêu cầu mạng tới nhà cung cấp AI lúc chơi và không có khóa trong mã client hay `dist/`.

Qwen 3 chạy cục bộ qua Ollama đã được dùng **trong quá trình phát triển** để phác thảo bốn bộ nguồn; nội dung sau đó được biên tập lại và cố định trong JSON. Điều này không biến chế độ chơi mặc định thành AI.

Để bổ sung AI khi có backend và khóa hợp lệ: endpoint phía máy chủ nhận một `Scenario` mẫu, trả bản nháp cùng schema; kiểm tra kiểu, độ dài, ID nguồn, liên kết dẫn nguồn và tính nhất quán bằng chứng; chỉ đưa bản nháp vào game sau bước duyệt thủ công. Khóa nằm trong biến môi trường **máy chủ**, không gửi tới Vite/client. Gợi ý AI (nếu bổ sung) chỉ nhận sandbox hiện tại và lịch sử thao tác tối thiểu, hỏi về *bước kiểm tra tiếp theo*, không đưa kết luận; lỗi hoặc trả lời lạc đề phải quay về `hints` soạn sẵn. Không gửi nội dung người chơi nhập sang dịch vụ ngoài khi chưa có cấu hình và thông báo rõ. **Đáp án và phản hồi cuối luôn dựa trên `evidenceRules`, không do AI chấm tự do.** Endpoint AI chưa được triển khai trong demo này vì không có cấu hình máy chủ/khóa để vận hành an toàn.

## Kết quả kiểm tra

Đã chạy `npm run verify` và `npm run build` thành công. `verify` kiểm tra đủ bốn trạng thái, 6 nguồn và 6 quy tắc mỗi màn, các ID liên kết, nội dung nguồn, điểm lập luận và trường hợp “không thấy thông báo” không bị chấm thành sai. Trên trình duyệt, đã chơi trọn **cả bốn màn** bằng bàn phím đến phản hồi đúng; thử tìm kiếm, ghi sổ tay, gợi ý, biến thể mẫu, thay đổi quyết định trước/sau, và tải lại để xác nhận phiên được khôi phục. Đã kiểm tra bố cục ở 390 px và 1280 px, không tràn ngang.

Giới hạn: bốn màn là sandbox cố định; chưa có endpoint AI, tài khoản hay nội dung trực tuyến. Bộ chấm điểm không thay thế đánh giá sư phạm của giáo viên.
