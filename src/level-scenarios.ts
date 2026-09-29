import type { EvidenceRole, Scenario, SchoolLevel, SourceType, TruthStatus } from './types'

type SourceSeed = [type: SourceType, title: string, author: string, content: string, role: EvidenceRole, limitation: string]

interface LevelSeed {
  id: string
  level: SchoolLevel
  title: string
  topic: string
  claim: string
  status: TruthStatus
  goal: string
  sources: SourceSeed[]
  explanation: string
  questions: [string, string]
}

function makeScenario(seed: LevelSeed): Scenario {
  const prefix = seed.level === 'primary' ? 'th-' : 'pt-'
  const id = prefix + seed.id
  return {
    id, schoolLevel: seed.level, title: seed.title,
    ageBand: seed.level === 'primary' ? 'Lớp 3–5' : 'Lớp 10–12',
    learningGoal: seed.goal, claim: seed.claim, truthStatus: seed.status,
    topic: seed.topic, difficulty: seed.level === 'primary' ? 'Dễ' : 'Nâng cao',
    sources: seed.sources.map(([type, title, author, content], index) => ({
      id: `${id}-nguon-${index + 1}`, type, title, author, publishedAt: '2026-10-05',
      content, citesSourceIds: [], relevanceNote: seed.level === 'primary'
        ? seed.sources[index][4] === 'insufficient' ? 'Nguồn này chưa trả lời rõ điều em hỏi.' : 'Em hãy xem nguồn nói về ai và ngày nào.'
        : seed.sources[index][4] === 'insufficient' ? 'Nguồn này chưa tự xác nhận được toàn bộ lời đồn.' : 'So nội dung và phạm vi của nguồn với lời đồn ban đầu.',
    })),
    evidenceRules: seed.sources.map(([, , , , role, limitation], index) => ({
      sourceId: `${id}-nguon-${index + 1}`, role, limitation,
      explanation: role === 'supports' ? 'Nguồn xác nhận điều đang kiểm tra.'
        : role === 'refutes' ? 'Nguồn cho thấy lời đồn không đúng như đã kể.'
          : role === 'context' ? 'Nguồn bổ sung bối cảnh nhưng chưa quyết định cả câu.'
            : 'Nguồn chưa đủ để chốt đúng hay sai.',
    })),
    hints: seed.level === 'primary'
      ? ['Ai nói tin này?', `Hãy xem ${seed.sources[1][1].toLocaleLowerCase('vi')}.`, 'Nguồn nói đúng lớp và đúng ngày không?']
      : ['Ai là người tạo thông tin đầu tiên?', `Hãy đọc ${seed.sources[1][1].toLocaleLowerCase('vi')}.`, 'Ngày và phạm vi trong nguồn có khớp với lời đồn không?'],
    teacherNotes: `${seed.goal} Cho học sinh đọc lời đồn, mở nguồn đầu tiên rồi đối chiếu với ${seed.sources[1][1]}. Nhắc các em phân biệt điều nguồn thật sự nói với phần người khác suy ra.`,
    variantClaims: [`Một bạn chuyển tiếp: ${seed.claim}`, `Bạn thấy một lời nhắn khác: ${seed.claim}`],
    feedback: { explanation: seed.explanation, questions: seed.questions },
  }
}

const primarySeeds: LevelSeed[] = [
  {
    id: 'thu-vien-thu-bay', level: 'primary', title: 'Thư viện có mở thứ Bảy?', topic: 'Thư viện', status: 'false',
    claim: 'Bạn Minh bảo thứ Bảy này thư viện trường mở cửa để cả lớp đến mượn truyện.',
    goal: 'Hỏi người phụ trách và đọc giờ mở cửa trước khi rủ bạn đến trường.',
    sources: [
      ['message', 'Lời nhắn của Minh', 'Minh, bạn cùng lớp', 'Minh nghe anh mình kể thư viện từng mở vào một thứ Bảy. Minh chưa xem lịch tuần này.', 'insufficient', 'Minh kể lại chuyện cũ.'],
      ['image', 'Ảnh bảng giờ thư viện', 'Cô thủ thư', 'Bảng ghi: thứ Hai đến thứ Sáu mở cửa; thứ Bảy và Chủ Nhật đóng cửa. Ảnh chụp đủ cả dòng ngày.', 'refutes', 'Bảng áp dụng cho tuần đang hỏi.'],
      ['message', 'Cô thủ thư trả lời', 'Cô Hạnh, thủ thư', 'Cô Hạnh nói thư viện đóng cửa thứ Bảy này. Các em có thể mượn truyện vào chiều thứ Sáu.', 'refutes', 'Lời cô nói về đúng thứ Bảy này.'],
    ],
    explanation: 'Thứ Bảy này thư viện đóng cửa. Lời Minh nhớ về một lần trước không phải lịch của tuần này.',
    questions: ['Minh đã xem bảng giờ của tuần này chưa?', 'Nếu thư viện dán lịch mở cửa đặc biệt vào thứ Bảy, em sẽ đổi câu trả lời không?'],
  },
  {
    id: 'ao-the-duc-thu-sau', level: 'primary', title: 'Thứ Sáu mặc áo thể dục?', topic: 'Trang phục', status: 'verified',
    claim: 'Có tin thứ Sáu lớp 4A cần mặc áo thể dục để chơi trò vận động ở sân trường.',
    goal: 'Tìm lời dặn của cô và lịch hoạt động đúng lớp, đúng ngày.',
    sources: [
      ['message', 'Bạn An nhắc trong nhóm', 'An, học sinh 4A', 'An nhớ cô dặn mặc áo thể dục. An nhắn lại để các bạn khỏi quên, nhưng không ghi ngày.', 'insufficient', 'Tin nhắn thiếu ngày.'],
      ['official', 'Lời dặn của cô chủ nhiệm', 'Cô Mai, giáo viên 4A', 'Cô Mai ghi rõ: thứ Sáu 09/10, lớp 4A mặc áo thể dục để tham gia trò vận động ở sân.', 'supports', 'Chỉ áp dụng cho lớp 4A vào ngày ghi.'],
      ['image', 'Ảnh lịch hoạt động lớp', 'Bảng tin lớp 4A', 'Trong ảnh lịch tuần, ô thứ Sáu có dòng “Trò vận động ngoài sân — mặc áo thể dục”.', 'supports', 'Ảnh cần đọc cùng ngày trên lịch.'],
    ],
    explanation: 'Lời dặn của cô và lịch lớp đều ghi rõ thứ Sáu 09/10 lớp 4A mặc áo thể dục.',
    questions: ['Dòng nào cho em biết tin này dành cho lớp 4A?', 'Nếu ảnh lịch là của tuần trước, em cần hỏi lại ai?'],
  },
  {
    id: 'san-choi-dong-cua', level: 'primary', title: 'Cả sân chơi bị đóng?', topic: 'Sân trường', status: 'misleading',
    claim: 'Một ảnh có dây chắn ở sân trường khiến nhiều bạn nói cả sân chơi đã đóng cửa.',
    goal: 'Xem ảnh toàn cảnh để biết chỉ một góc hay cả sân bị chắn.',
    sources: [
      ['image', 'Ảnh chụp sát dây chắn', 'Bạn Bảo', 'Ảnh chỉ thấy dây chắn và một góc nền sân. Ảnh không cho thấy phần còn lại của sân.', 'insufficient', 'Ảnh bị cắt hẹp.'],
      ['image', 'Ảnh toàn cảnh sân', 'Cô trực sân', 'Ảnh rộng cho thấy chỉ khu cầu trượt được chắn để sửa. Khoảng sân đá cầu vẫn mở.', 'refutes', 'Ảnh ghi nhận sân vào buổi sáng hôm đó.'],
      ['message', 'Cô trực sân giải thích', 'Cô trực sân', 'Cô dặn không vào khu cầu trượt đang sửa. Học sinh vẫn được chơi ở phần sân còn lại.', 'refutes', 'Cần nghe thông báo mới nếu khu vực đổi.'],
    ],
    explanation: 'Chỉ khu cầu trượt bị chắn để sửa. Câu “cả sân đóng cửa” nói quá phạm vi của ảnh.',
    questions: ['Ảnh đầu tiên cho thấy toàn bộ sân hay chỉ một góc?', 'Nếu dây chắn được kéo quanh cả sân, em sẽ kết luận thế nào?'],
  },
  {
    id: 'tham-quan-vuon-thu', level: 'primary', title: 'Tuần sau đi tham quan?', topic: 'Tham quan', status: 'insufficient',
    claim: 'Một bạn nói lớp 5B chắc chắn đi tham quan vườn thú vào tuần sau.',
    goal: 'Phân biệt ý định tổ chức với thông báo đã chốt ngày.',
    sources: [
      ['message', 'Bạn Phúc kể lại', 'Phúc, học sinh 5B', 'Phúc nghe các cô bàn về chuyến đi. Bạn chưa thấy giấy báo ngày hoặc địa điểm.', 'insufficient', 'Bạn chỉ nghe một phần cuộc nói chuyện.'],
      ['official', 'Giấy gửi phụ huynh', 'Giáo viên lớp 5B', 'Giấy viết nhà trường đang hỏi ý kiến phụ huynh về chuyến tham quan. Ngày đi chưa được quyết định.', 'insufficient', 'Đây là giấy hỏi ý kiến, chưa phải lịch đi.'],
      ['image', 'Ảnh bảng kế hoạch lớp', 'Ban cán sự lớp 5B', 'Bảng ghi “tham quan: chờ nhà trường xác nhận”. Chưa có ngày, giờ hoặc danh sách học sinh.', 'insufficient', 'Bảng vẫn có thể được cập nhật sau.'],
    ],
    explanation: 'Lớp đang hỏi ý kiến về chuyến đi. Chưa có lịch được xác nhận nên chưa thể nói chắc tuần sau sẽ đi.',
    questions: ['Trong giấy có ngày đi đã chốt chưa?', 'Nếu cô gửi giấy báo ngày và giờ cụ thể, em sẽ chọn gì?'],
  },
  {
    id: 'hop-but-bi-lay', level: 'primary', title: 'Hộp bút đã bị lấy mất?', topic: 'Bạn bè', status: 'false',
    claim: 'Hà không thấy hộp bút trên bàn và có bạn nói ai đó đã lấy mất.',
    goal: 'Kiểm tra chỗ để đồ trước khi kết luận về người khác.',
    sources: [
      ['message', 'Tin bạn gửi Hà', 'Một bạn cùng lớp', 'Bạn chỉ thấy bàn Hà trống và đoán có người lấy hộp bút. Bạn không thấy ai cầm nó.', 'insufficient', 'Đây chỉ là suy đoán.'],
      ['image', 'Ảnh ngăn tủ của Hà', 'Hà, học sinh lớp 3C', 'Hà mở ngăn tủ và chụp hộp bút của mình ở bên trong. Hà nhớ đã cất nó trước giờ ra chơi.', 'refutes', 'Ảnh xác nhận hộp bút này ở trong tủ.'],
      ['message', 'Hà báo lại cho lớp', 'Hà, học sinh lớp 3C', 'Hà nhắn đã tìm thấy hộp bút trong ngăn tủ. Hà xin lỗi vì lúc đầu quên mình đã cất.', 'refutes', 'Lời Hà xác nhận đúng món đồ của mình.'],
    ],
    explanation: 'Hà đã tìm thấy hộp bút trong tủ. Không có bằng chứng ai lấy món đồ này.',
    questions: ['Bạn đã nhìn thấy ai lấy hộp bút chưa?', 'Nếu hộp bút vẫn không có trong tủ, em nên tìm và hỏi thế nào?'],
  },
  {
    id: 'bua-trua-co-trai-cay', level: 'primary', title: 'Bữa trưa có thêm trái cây?', topic: 'Bữa trưa', status: 'verified',
    claim: 'Cô nuôi nói bữa trưa thứ Tư của lớp 3A sẽ có thêm một quả chuối.',
    goal: 'Đối chiếu lời kể với thực đơn có đúng lớp và đúng ngày.',
    sources: [
      ['message', 'Bạn Vy kể', 'Vy, học sinh lớp 3A', 'Vy nghe cô nuôi nói có chuối trong bữa trưa. Bạn không nhớ đó là thứ mấy.', 'insufficient', 'Lời kể chưa rõ ngày.'],
      ['image', 'Ảnh thực đơn tuần', 'Bếp ăn trường Sao Mai', 'Ô thứ Tư của lớp 3A ghi “cơm, rau, cá và một quả chuối”.', 'supports', 'Thực đơn ghi cho tuần hiện tại.'],
      ['message', 'Cô nuôi xác nhận', 'Cô Lan, bếp ăn', 'Cô Lan nói mỗi phần trưa thứ Tư của lớp 3A có một quả chuối như thực đơn.', 'supports', 'Nếu thực đơn đổi, cô sẽ báo lại.'],
    ],
    explanation: 'Thực đơn và cô nuôi đều xác nhận bữa trưa thứ Tư của lớp 3A có chuối.',
    questions: ['Thực đơn ghi chuối vào thứ mấy?', 'Nếu ảnh thực đơn là của lớp khác, em sẽ kiểm tra ở đâu?'],
  },
  {
    id: 'mang-chau-cay', level: 'primary', title: 'Ai cũng phải mang chậu cây?', topic: 'Lớp học', status: 'misleading',
    claim: 'Một bạn bảo cả lớp 4B phải mang chậu cây đến trường vào thứ Hai.',
    goal: 'Đọc kỹ xem nhiệm vụ thuộc cả lớp hay một nhóm nhỏ.',
    sources: [
      ['message', 'Tin nhắn của Nam', 'Nam, học sinh 4B', 'Nam thấy các bạn nói về chậu cây và nghĩ ai cũng phải mang. Nam chưa xem bảng phân công.', 'insufficient', 'Nam suy ra từ cuộc nói chuyện.'],
      ['image', 'Ảnh bảng phân công', 'Cô chủ nhiệm lớp 4B', 'Bảng ghi nhóm 2 mang hai chậu cây vào thứ Hai. Các nhóm khác chuẩn bị nhãn tên cây.', 'refutes', 'Bảng chỉ phân công tuần này.'],
      ['message', 'Bạn lớp trưởng nhắc lại', 'Lớp trưởng 4B', 'Lớp trưởng đọc bảng: chỉ nhóm 2 mang chậu cây; những bạn khác không cần mang.', 'refutes', 'Lời nhắc dựa trên bảng phân công.'],
    ],
    explanation: 'Chỉ nhóm 2 mang chậu cây. Tin “cả lớp phải mang” đã nói rộng hơn bảng phân công.',
    questions: ['Trên bảng ghi tên nhóm nào?', 'Nếu bảng đổi thành “cả lớp”, em cần chuẩn bị gì?'],
  },
  {
    id: 'nghi-hoc-vi-mua', level: 'primary', title: 'Ngày mai được nghỉ vì mưa?', topic: 'Thời tiết', status: 'insufficient',
    claim: 'Trời mưa to nên một bạn đoán ngày mai trường sẽ cho học sinh nghỉ.',
    goal: 'Biết chờ thông báo của trường thay vì biến một dự đoán thành lịch nghỉ.',
    sources: [
      ['message', 'Bạn Duy đoán', 'Duy, học sinh lớp 5A', 'Duy nhìn mưa ngoài cửa sổ và nói chắc ngày mai nghỉ. Duy chưa nghe cô hoặc trường báo.', 'insufficient', 'Thời tiết hôm nay không quyết định lịch ngày mai.'],
      ['official', 'Bảng thông báo cuối buổi', 'Văn phòng trường', 'Bảng thông báo hiện chưa ghi thay đổi lịch học ngày mai. Nhà trường sẽ báo phụ huynh nếu có thay đổi.', 'insufficient', 'Không thấy thông báo chưa chứng minh ngày mai chắc chắn học.'],
      ['message', 'Cô chủ nhiệm dặn', 'Cô Mai, giáo viên lớp 5A', 'Cô dặn các em theo dõi tin từ trường cùng phụ huynh tối nay. Cô chưa nhận quyết định nghỉ học.', 'insufficient', 'Quyết định có thể được đưa ra sau.'],
    ],
    explanation: 'Bạn Duy đang đoán. Chưa có quyết định nghỉ học nên cần chờ thông báo của trường.',
    questions: ['Bạn Duy biết tin từ trường hay chỉ nhìn trời mưa?', 'Nếu tối nay trường gửi thông báo nghỉ, em sẽ đổi lựa chọn nào?'],
  },
  {
    id: 'mi-thuat-doi-phong', level: 'primary', title: 'Tiết Mỹ thuật đổi phòng?', topic: 'Giờ học', status: 'verified',
    claim: 'Tiết Mỹ thuật chiều thứ Năm của lớp 3B chuyển sang phòng 12.',
    goal: 'Kiểm tra cả tên lớp, tiết học và số phòng trong lời dặn.',
    sources: [
      ['message', 'Bạn Hoa nhắn', 'Hoa, học sinh 3B', 'Hoa nhắc các bạn đến phòng 12. Hoa chưa nói rõ đó là tiết học nào.', 'insufficient', 'Tin nhắn thiếu tên tiết.'],
      ['image', 'Ảnh lịch trên cửa lớp', 'Giáo viên lớp 3B', 'Dòng chiều thứ Năm ghi “Mỹ thuật — phòng 12” và có tên lớp 3B ở đầu bảng.', 'supports', 'Lịch có thể được sửa nếu phòng bận.'],
      ['message', 'Thầy Mỹ thuật dặn', 'Thầy Sơn, giáo viên Mỹ thuật', 'Thầy Sơn nhắc lớp 3B đến phòng 12 cho tiết Mỹ thuật chiều thứ Năm.', 'supports', 'Lời dặn áp dụng cho tiết này.'],
    ],
    explanation: 'Lịch trên cửa lớp và lời thầy Mỹ thuật đều xác nhận phòng 12 cho lớp 3B chiều thứ Năm.',
    questions: ['Trên ảnh có đúng tên lớp 3B không?', 'Nếu thầy báo phòng 12 đang sửa, em cần hỏi phòng mới ở đâu?'],
  },
  {
    id: 'nop-tien-trang-tri', level: 'primary', title: 'Cả lớp phải nộp tiền trang trí?', topic: 'Trang trí lớp', status: 'false',
    claim: 'Có lời nhắn rằng ngày mai mỗi bạn lớp 5C phải nộp 20.000 đồng để trang trí lớp.',
    goal: 'Hỏi giáo viên trước khi tin lời nhắc thu tiền chưa rõ người gửi.',
    sources: [
      ['message', 'Lời nhắn chuyển tiếp', 'Người gửi không rõ', 'Tin nhắn yêu cầu mang 20.000 đồng nhưng không ghi tên cô, ngày thu hoặc giấy báo cho phụ huynh.', 'insufficient', 'Không xác định được người yêu cầu.'],
      ['message', 'Cô chủ nhiệm trả lời', 'Cô Hà, giáo viên 5C', 'Cô Hà nói lớp dùng giấy màu đã có và không thu 20.000 đồng từ học sinh ngày mai.', 'refutes', 'Câu trả lời dành cho hoạt động trang trí này.'],
      ['image', 'Ảnh kế hoạch trang trí', 'Bảng tin lớp 5C', 'Kế hoạch ghi các nhóm dùng giấy màu trong tủ lớp. Không có mục đóng tiền.', 'refutes', 'Kế hoạch chỉ nói về lần trang trí này.'],
    ],
    explanation: 'Cô chủ nhiệm xác nhận lớp không thu khoản tiền đó; kế hoạch cũng chỉ dùng vật liệu có sẵn.',
    questions: ['Tin chuyển tiếp có ghi ai yêu cầu nộp tiền không?', 'Nếu cô gửi giấy báo có chữ ký cho phụ huynh, em sẽ làm gì?'],
  },
  {
    id: 'thi-ve-bi-huy', level: 'primary', title: 'Cuộc thi vẽ bị hủy?', topic: 'Hội thi', status: 'misleading',
    claim: 'Một bạn nói cuộc thi vẽ của khối 4 bị hủy vì hôm nay không thấy tổ chức.',
    goal: 'Phân biệt hoãn ngày với hủy cả cuộc thi.',
    sources: [
      ['message', 'Bạn Tâm đoán', 'Tâm, học sinh khối 4', 'Tâm đến hội trường hôm nay nhưng không thấy cuộc thi. Tâm nghĩ cuộc thi đã hủy.', 'insufficient', 'Không thấy sự kiện hôm nay chưa chứng minh đã hủy.'],
      ['official', 'Thông báo đổi ngày thi', 'Ban tổ chức hội thi', 'Thông báo ghi cuộc thi vẽ chuyển từ thứ Hai sang thứ Sáu 09/10. Người đăng ký vẫn giữ tên.', 'refutes', 'Áp dụng cho cuộc thi khối 4 này.'],
      ['image', 'Ảnh lịch hội trường', 'Cô phụ trách hội trường', 'Lịch hội trường ghi thứ Sáu 09/10 dành cho cuộc thi vẽ khối 4.', 'refutes', 'Lịch xác nhận phòng, không thay thông báo tổ chức.'],
    ],
    explanation: 'Cuộc thi được chuyển sang thứ Sáu, không bị hủy. Việc hôm nay không diễn ra chỉ cho thấy ngày đã đổi.',
    questions: ['Thông báo viết “hủy” hay “chuyển ngày”?', 'Nếu ban tổ chức viết rõ cuộc thi bị hủy, em sẽ chọn gì?'],
  },
  {
    id: 'xem-phim-hoi-truong', level: 'primary', title: 'Lớp 5A được xem phim?', topic: 'Hoạt động lớp', status: 'verified',
    claim: 'Lớp 5A sẽ xem một phim ngắn ở hội trường vào chiều thứ Sáu.',
    goal: 'Dùng lịch lớp và lời cô xác nhận thời gian của hoạt động.',
    sources: [
      ['message', 'Bạn Khoa rủ đi sớm', 'Khoa, học sinh 5A', 'Khoa nghe có buổi xem phim và rủ bạn đi sớm. Bạn chưa nhớ buổi sáng hay chiều.', 'insufficient', 'Tin của Khoa thiếu buổi học.'],
      ['image', 'Ảnh lịch lớp 5A', 'Cô chủ nhiệm 5A', 'Ô chiều thứ Sáu ghi “xem phim ngắn tại hội trường”; ô buổi sáng vẫn là giờ học thường.', 'supports', 'Lịch dành cho lớp 5A tuần này.'],
      ['message', 'Cô chủ nhiệm nhắc', 'Cô Linh, giáo viên 5A', 'Cô Linh dặn lớp 5A đến hội trường vào chiều thứ Sáu để xem phim ngắn.', 'supports', 'Nếu hội trường đổi lịch cô sẽ báo.'],
    ],
    explanation: 'Lịch lớp và cô chủ nhiệm đều xác nhận buổi xem phim chiều thứ Sáu tại hội trường.',
    questions: ['Lịch ghi buổi sáng hay buổi chiều?', 'Nếu hội trường thông báo đổi giờ, em sẽ xem lịch ở đâu?'],
  },
]

export const primaryScenarios: Scenario[] = primarySeeds.map(makeScenario)

const highSeeds: LevelSeed[] = [
  {
    id: 'tro-cap-hoc-tap', level: 'high', title: 'Mọi học sinh đều được trợ cấp?', topic: 'Chính sách công', status: 'misleading',
    claim: 'Một page viết thành phố Hòa Lâm sẽ trả 1 triệu đồng mỗi tháng cho mọi học sinh THPT từ năm 2027.',
    goal: 'Phân biệt dự thảo, nhóm được đề xuất hỗ trợ và quyết định đã có hiệu lực.',
    sources: [
      ['social', 'Bài đăng “Ai cũng được tiền”', 'Page Học đường Hòa Lâm', 'Page chụp một dòng về mức hỗ trợ 1 triệu đồng rồi viết rằng tất cả học sinh THPT sẽ nhận tiền. Bài không dẫn phần điều kiện hoặc ngày hiệu lực.', 'insufficient', 'Page diễn giải một đoạn cắt khỏi bản dự thảo.'],
      ['legal', 'Điều 4 dự thảo hỗ trợ học tập mô phỏng', 'Hội đồng thành phố Hòa Lâm hư cấu', 'Bản dự thảo mô phỏng đề xuất hỗ trợ tối đa 1 triệu đồng mỗi tháng cho học sinh thuộc hộ khó khăn. Văn bản chưa được thông qua và không áp dụng cho mọi học sinh.', 'refutes', 'Dự thảo chưa phải quy định có hiệu lực.'],
      ['article', 'Bản tin về phiên lấy ý kiến', 'Báo Hòa Lâm mô phỏng', 'Bài viết giải thích hội đồng đang lấy ý kiến về hỗ trợ học sinh khó khăn. Phóng viên nhấn mạnh mức 1 triệu là trần đề xuất, chưa phải khoản chi trả đã bắt đầu.', 'refutes', 'Bài báo tường thuật dự thảo, không thay văn bản gốc.'],
      ['image', 'Ảnh chụp trang đầu dự thảo', 'Nhóm học sinh tìm hiểu chính sách', 'Ảnh đầy đủ cho thấy chữ “Dự thảo lấy ý kiến” ở đầu trang và mục đối tượng chỉ ghi học sinh có hoàn cảnh khó khăn, trái với ảnh cắt trên page.', 'context', 'Ảnh xác định trạng thái văn bản tại lúc chụp.'],
    ],
    explanation: 'Page đã biến một đề xuất có điều kiện thành khoản trợ cấp cho mọi học sinh. Văn bản mô phỏng mới là dự thảo, chưa có hiệu lực.',
    questions: ['Page đã bỏ qua điều kiện nào trong dự thảo?', 'Nếu văn bản chính thức sau này mở rộng cho mọi học sinh, em sẽ kiểm tra ngày hiệu lực ở đâu?'],
  },
  {
    id: 'mon-thi-bat-buoc', level: 'high', title: 'Kỳ thi thử thêm môn bắt buộc?', topic: 'Quy chế thi', status: 'false',
    claim: 'Ảnh lan truyền nói kỳ thi thử của cụm trường Hòa Lâm tháng 11 sẽ bắt buộc thêm môn Tin học.',
    goal: 'Đọc đủ trang hướng dẫn kỳ thi thử và kiểm tra ảnh có bị sửa hay không.',
    sources: [
      ['image', 'Ảnh lịch thi bị ghép', 'Tài khoản không rõ tên', 'Ảnh hiển thị thêm dòng “Tin học bắt buộc” bằng phông chữ khác. Góc trên không có số văn bản và phần cuối bị cắt mất.', 'insufficient', 'Không xác định được bản gốc của ảnh.'],
      ['official', 'Hướng dẫn kỳ thi thử tháng 11', 'Ban tổ chức cụm trường Hòa Lâm hư cấu', 'Văn bản mô phỏng liệt kê các bài thi đã đăng ký và cho phép chọn Tin học như môn tự chọn. Không có dòng nào biến Tin học thành môn bắt buộc.', 'refutes', 'Chỉ nói về kỳ thi thử của cụm trường này.'],
      ['legal', 'Phụ lục đăng ký môn thi mô phỏng', 'Ban tổ chức cụm trường Hòa Lâm hư cấu', 'Phụ lục đánh dấu Tin học ở cột môn tự chọn. Cột môn bắt buộc không ghi Tin học. Số phiên bản phụ lục khớp văn bản hướng dẫn.', 'refutes', 'Phụ lục đi kèm hướng dẫn, không áp dụng kỳ thi khác.'],
      ['video', 'Video giải thích lịch thi và bản chép lời', 'Giáo viên phụ trách cụm trường', 'Bản chép lời video mô phỏng ở phút 01:12: “Tin học là môn tự chọn trong kỳ thi thử này.” Khung hình hiện trang phụ lục đầy đủ và ngày phát hành.', 'context', 'Video nhắc lại tài liệu gốc, không là quy chế quốc gia.'],
    ],
    explanation: 'Hướng dẫn và phụ lục của kỳ thi thử mô phỏng đều ghi Tin học là môn tự chọn. Ảnh thêm chữ “bắt buộc” không khớp bản gốc.',
    questions: ['Ảnh lan truyền thiếu dấu hiệu nào của một văn bản đầy đủ?', 'Nếu ban tổ chức ban hành bản sửa đổi mới, em sẽ kiểm tra số phiên bản ra sao?'],
  },
  {
    id: 'hoc-bong-han-nop', level: 'high', title: 'Học bổng còn nhận hồ sơ?', topic: 'Học bổng', status: 'verified',
    claim: 'Quỹ Học bổng Ánh Sao mô phỏng nhận hồ sơ học sinh lớp 11 đến 17 giờ ngày 20/10/2026.',
    goal: 'Đối chiếu hạn nộp và điều kiện trên trang quỹ với biểu mẫu đang phát.',
    sources: [
      ['social', 'Bài giới thiệu học bổng', 'Page Tư vấn học đường', 'Page nói quỹ còn nhận hồ sơ và gắn ảnh cũ. Bài không ghi giờ khóa đơn hoặc điều kiện lớp học nên chỉ gợi nơi cần kiểm tra.', 'insufficient', 'Page không phải nơi nhận hồ sơ.'],
      ['official', 'Thông báo tuyển học bổng mô phỏng', 'Quỹ Học bổng Ánh Sao hư cấu', 'Thông báo năm 2026 ghi học sinh lớp 11 nộp hồ sơ đến 17:00 ngày 20/10. Bản mô phỏng cũng nêu địa chỉ tiếp nhận tại văn phòng quỹ, không yêu cầu chuyển tiền.', 'supports', 'Áp dụng cho đợt tuyển năm 2026.'],
      ['image', 'Ảnh biểu mẫu năm 2026', 'Văn phòng Quỹ Ánh Sao', 'Biểu mẫu có ô lớp 11 và dòng cuối ghi hạn nhận 17:00 ngày 20/10/2026. Góc trang có mã đợt trùng thông báo của quỹ.', 'supports', 'Biểu mẫu cùng nguồn với thông báo tuyển.'],
      ['article', 'Bản tin hoạt động quỹ', 'Báo Trẻ Hòa Lâm mô phỏng', 'Bài phỏng vấn người phụ trách quỹ ngày 05/10 xác nhận đợt hồ sơ lớp 11 đang mở đến 20/10. Bài dẫn người đọc tới thông báo chính thức để xem điều kiện chi tiết.', 'supports', 'Báo tường thuật, cần xem thông báo nếu quy định đổi.'],
    ],
    explanation: 'Thông báo của quỹ, biểu mẫu hiện tại và bản tin đều cùng chỉ đến hạn 17 giờ ngày 20/10 cho học sinh lớp 11.',
    questions: ['Mã đợt trên biểu mẫu giúp em kiểm tra điều gì?', 'Nếu quỹ đăng thông báo gia hạn mới, em nên dùng hạn nào?'],
  },
  {
    id: 'ca-si-huy-dem-nhac', level: 'high', title: 'Ca sĩ đã hủy đêm nhạc?', topic: 'Người nổi tiếng', status: 'false',
    claim: 'Video ngắn nói ca sĩ hư cấu Lam Anh hủy đêm nhạc gây quỹ ngày 18/10 vì đang có tranh cãi trên mạng.',
    goal: 'Xem bản video đầy đủ và thông báo của đơn vị tổ chức trước khi chia sẻ tin về một cá nhân.',
    sources: [
      ['video', 'Clip 9 giây lan truyền và bản chép lời', 'Tài khoản Sao Nhanh', 'Clip dừng ngay sau câu “Tôi sẽ không xuất hiện ở buổi gặp báo chí”. Dòng chữ do tài khoản thêm vào viết “hủy đêm nhạc”. Video không chiếu phần nói tiếp.', 'insufficient', 'Clip cắt ngữ cảnh và phụ đề không phải lời nói.'],
      ['official', 'Thông báo lịch diễn 18/10 mô phỏng', 'Ban tổ chức Đêm nhạc Ánh Đèn hư cấu', 'Thông báo cập nhật vẫn ghi Lam Anh biểu diễn trong đêm nhạc ngày 18/10. Sự kiện gặp báo chí riêng đã được hủy để chuyển sang hình thức trực tuyến.', 'refutes', 'Thông báo phản ánh lịch tại ngày đăng.'],
      ['video', 'Video đầy đủ với bản chép lời', 'Kênh chính thức của Lam Anh hư cấu', 'Phút 02:05 của video đầy đủ nói: “Tôi không đến buổi gặp báo chí trực tiếp, nhưng vẫn biểu diễn tối 18/10.” Khung hình giữ liên tục trước và sau câu nói.', 'refutes', 'Nội dung nói về kế hoạch tại thời điểm ghi hình.'],
      ['article', 'Bài kiểm tra lịch sự kiện', 'Báo Văn hóa Hòa Lâm mô phỏng', 'Phóng viên hỏi ban tổ chức và xác nhận đêm nhạc vẫn bán vé; chỉ buổi gặp báo chí đổi hình thức. Bài tách rõ hai sự kiện dễ bị nhầm.', 'refutes', 'Bài báo dẫn lời ban tổ chức, không thay lịch cập nhật.'],
    ],
    explanation: 'Clip đã ghép việc hủy buổi gặp báo chí thành hủy đêm nhạc. Video đầy đủ và lịch tổ chức vẫn xác nhận Lam Anh biểu diễn.',
    questions: ['Phụ đề “hủy đêm nhạc” có phải lời Lam Anh nói không?', 'Nếu ban tổ chức ra thông báo hủy đêm nhạc sau đó, em sẽ cập nhật kết luận thế nào?'],
  },
  {
    id: 'phat-ngon-bi-cat', level: 'high', title: 'Diễn viên phản đối đọc sách?', topic: 'Truyền thông số', status: 'misleading',
    claim: 'Một page trích diễn viên hư cấu Mai Khuê: “Đọc sách chỉ làm mất thời gian”, rồi nói cô phản đối hoạt động đọc sách.',
    goal: 'Xem câu nói trước và sau trích dẫn, phân biệt lời dẫn với quan điểm của người nói.',
    sources: [
      ['social', 'Thẻ trích dẫn trên page', 'Page Chuyện Sao Hòa Lâm', 'Thẻ ảnh đặt câu “Đọc sách chỉ làm mất thời gian” cạnh chân dung Mai Khuê. Page bỏ dấu ngoặc dẫn lời nhân vật trong phim và không ghi buổi phỏng vấn.', 'insufficient', 'Thẻ ảnh thiếu ngữ cảnh phát ngôn.'],
      ['video', 'Phỏng vấn đầy đủ và bản chép lời', 'Kênh Văn hóa Trẻ mô phỏng', 'Ở phút 03:40, Mai Khuê nói: “Nhân vật tôi đóng nghĩ đọc sách chỉ làm mất thời gian. Ngoài đời tôi lại thích đọc.” Bản ghi hình liền mạch cho thấy cô đang so sánh.', 'refutes', 'Video thể hiện cuộc phỏng vấn này, không mọi quan điểm của cô.'],
      ['article', 'Bài phỏng vấn bản chữ', 'Tạp chí Sân Khấu mô phỏng', 'Bản chữ chép cả câu trước và sau, ghi rõ phần “mất thời gian” là suy nghĩ của nhân vật hư cấu. Mai Khuê kể về câu lạc bộ đọc sách cô tham gia.', 'refutes', 'Bài chữ cần đối chiếu với bản ghi hình nếu nghi chép sai.'],
      ['image', 'Ảnh trang kịch bản', 'Đoàn phim hư cấu', 'Ảnh kịch bản ghi nhân vật nói câu phản đối đọc sách trong cảnh 12. Đây là lời thoại trong tác phẩm, không là tuyên bố riêng của diễn viên.', 'context', 'Kịch bản không chứng minh hoạt động ngoài đời của cô.'],
    ],
    explanation: 'Page đã cắt một câu Mai Khuê dùng để mô tả nhân vật và biến nó thành quan điểm của cô. Bản phỏng vấn đầy đủ cho thấy điều ngược lại.',
    questions: ['Ai thật sự tin “đọc sách mất thời gian” trong cuộc phỏng vấn?', 'Nếu bản ghi đầy đủ cho thấy Mai Khuê tự nói câu đó về mình, kết luận có thay đổi không?'],
  },
  {
    id: 'hop-dong-quang-cao', level: 'high', title: 'Nhãn hàng đã cắt hợp đồng?', topic: 'Người nổi tiếng', status: 'insufficient',
    claim: 'Một diễn đàn nói nhãn hàng hư cấu Sao Xanh đã cắt hợp đồng với người dẫn chương trình Bảo Nam sau một tranh cãi.',
    goal: 'Nhận ra ảnh biến mất trên trang chủ không đủ xác nhận một hợp đồng riêng tư đã chấm dứt.',
    sources: [
      ['social', 'Bài viết từ diễn đàn giải trí', 'Diễn đàn Nghe Kể', 'Bài đăng so hai ảnh giao diện rồi khẳng định hợp đồng bị cắt. Người viết không cung cấp thông báo từ nhãn hàng hoặc người dẫn chương trình.', 'insufficient', 'Diễn đàn suy luận từ ảnh giao diện.'],
      ['image', 'Ảnh trang chủ hai ngày', 'Một độc giả chụp màn hình', 'Ảnh ngày 01/10 có Bảo Nam ở banner; ảnh ngày 05/10 đổi sang sản phẩm mới. Hai ảnh chỉ chứng minh banner đã thay.', 'context', 'Đổi banner không cho biết tình trạng hợp đồng.'],
      ['official', 'Phản hồi của nhãn hàng mô phỏng', 'Bộ phận truyền thông Sao Xanh hư cấu', 'Nhãn hàng nói đang thay chiến dịch quảng bá và không bình luận về điều khoản hợp đồng cá nhân. Không có câu nào xác nhận đã chấm dứt hợp tác.', 'insufficient', 'Từ chối bình luận không đồng nghĩa phủ nhận hay xác nhận.'],
      ['article', 'Bài tổng hợp nguồn hiện có', 'Báo Văn hóa Hòa Lâm mô phỏng', 'Bài báo liệt kê banner cũ, banner mới và phản hồi không bình luận. Tác giả kết luận hiện chưa đủ thông tin công khai để xác nhận hợp đồng còn hay hết.', 'insufficient', 'Bài tường thuật không có hồ sơ hợp đồng.'],
    ],
    explanation: 'Những nguồn hiện có chỉ cho thấy banner thay đổi. Chưa có xác nhận về hợp đồng, nên chưa thể nói chắc nhãn hàng đã cắt hợp tác.',
    questions: ['Ảnh trang chủ chứng minh điều gì, và chưa chứng minh điều gì?', 'Nếu hai bên công bố thông báo chấm dứt hợp tác có ngày rõ ràng, em sẽ đổi lựa chọn nào?'],
  },
  {
    id: 've-xe-hoc-sinh', level: 'high', title: 'Có vé xe giảm giá cho học sinh?', topic: 'Giao thông công cộng', status: 'verified',
    claim: 'Thành phố hư cấu Hòa Lâm áp dụng vé xe buýt tháng giảm giá cho học sinh THPT từ 01/11/2026.',
    goal: 'Kiểm tra văn bản hiệu lực, phạm vi tuyến và hướng dẫn của đơn vị vận hành.',
    sources: [
      ['social', 'Page cộng đồng chia sẻ', 'Page Xe Buýt Hòa Lâm', 'Page viết học sinh sắp được giảm giá vé tháng và gắn ảnh một phần văn bản. Page không nói rõ ngày bắt đầu hoặc tuyến áp dụng.', 'insufficient', 'Page cộng đồng không phát hành chính sách.'],
      ['legal', 'Điều 2 quyết định vé tháng mô phỏng', 'Cơ quan giao thông Hòa Lâm hư cấu', 'Quyết định mô phỏng đã ký ghi từ 01/11/2026, học sinh THPT được mua vé tháng ưu đãi trên các tuyến nội đô được liệt kê ở phụ lục. Văn bản không áp dụng vé lượt.', 'supports', 'Chỉ áp dụng tuyến và loại vé ghi trong quyết định.'],
      ['official', 'Hướng dẫn bán vé ưu đãi', 'Đơn vị xe buýt Hòa Lâm hư cấu', 'Hướng dẫn mở bán vé tháng học sinh cho các tuyến nội đô từ 01/11. Người mua xuất trình thẻ học sinh còn hiệu lực tại quầy; giá khớp bảng công bố.', 'supports', 'Hướng dẫn vận hành dựa trên quyết định mô phỏng.'],
      ['article', 'Bài hỏi đáp về vé tháng', 'Báo Đô thị Hòa Lâm mô phỏng', 'Bài báo hỏi cơ quan vận hành về các tuyến áp dụng và phân biệt vé tháng ưu đãi với vé lượt thông thường. Thông tin về ngày 01/11 khớp quyết định.', 'supports', 'Báo là nguồn thứ cấp, nên xem văn bản nếu lịch đổi.'],
    ],
    explanation: 'Quyết định và hướng dẫn mô phỏng cùng xác nhận vé tháng ưu đãi cho học sinh THPT từ 01/11 trên các tuyến đã liệt kê.',
    questions: ['Tin về vé tháng có đồng nghĩa mọi lượt xe đều giảm giá không?', 'Nếu phụ lục không có tuyến em đi, em có được áp dụng mức ưu đãi ấy không?'],
  },
  {
    id: 'phi-ly-nhua', level: 'high', title: 'Sắp thu phí mọi ly nhựa?', topic: 'Môi trường', status: 'insufficient',
    claim: 'Bài viết khẳng định Hòa Lâm sẽ thu phí bắt buộc với mọi ly nhựa từ 01/01/2027.',
    goal: 'Phân biệt tài liệu tham vấn chính sách với quyết định đã ban hành.',
    sources: [
      ['article', 'Bài dự báo về phí ly nhựa', 'Tạp chí Đô thị Xanh mô phỏng', 'Bài viết dựa trên cuộc họp về giảm rác thải và dùng từ “có thể thu phí”. Khi chia sẻ lại, tiêu đề bị sửa thành “sẽ thu phí mọi ly”.', 'insufficient', 'Bài dự báo không phải quyết định.'],
      ['legal', 'Đề cương tham vấn mô phỏng', 'Nhóm nghiên cứu môi trường Hòa Lâm hư cấu', 'Đề cương nêu ba phương án: tuyên truyền, ưu đãi ly tái sử dụng hoặc thu một khoản với ly dùng một lần ở vài khu vực. Chưa chọn phương án hay ngày thực hiện.', 'insufficient', 'Đề cương không có hiệu lực áp dụng.'],
      ['video', 'Họp tham vấn và bản chép lời', 'Kênh hội đồng thành phố hư cấu', 'Bản chép lời phút 12:20 ghi người chủ trì nói chưa quyết định chọn giải pháp nào. Video không công bố mức thu hoặc phạm vi bắt buộc.', 'insufficient', 'Cuộc họp chỉ ghi nhận ý kiến tại thời điểm đó.'],
      ['social', 'Bài bình luận của cư dân', 'Page Sống Xanh Hòa Lâm', 'Page kêu gọi mang bình cá nhân và hỏi liệu thành phố có thu phí không. Phần bình luận có nhiều dự đoán nhưng không kèm văn bản đã ký.', 'context', 'Ý kiến cộng đồng không xác nhận quyết định.'],
    ],
    explanation: 'Hòa Lâm mới đang tham vấn nhiều phương án mô phỏng. Không có quyết định thu phí tất cả ly nhựa từ ngày được nêu.',
    questions: ['Tài liệu nào trong các nguồn đã có hiệu lực?', 'Nếu hội đồng công bố quyết định đã ký với ngày áp dụng, em sẽ cần kiểm tra thêm điều gì?'],
  },
  {
    id: 'mien-phi-du-thi', level: 'high', title: 'Mọi thí sinh được miễn lệ phí?', topic: 'Quy chế thi', status: 'misleading',
    claim: 'Một page nói kỳ thi đánh giá năng lực của Học viện Hòa Lâm mô phỏng miễn lệ phí cho tất cả thí sinh năm 2027.',
    goal: 'Đọc điều kiện miễn phí và tránh biến quy định cho một nhóm thành quy định chung.',
    sources: [
      ['social', 'Ảnh cắt dòng “miễn lệ phí”', 'Page Ôn thi Nhanh', 'Page chụp dòng “được miễn lệ phí đăng ký” rồi viết mọi thí sinh đều hưởng. Ảnh bỏ mất câu phía trước nêu nhóm đủ điều kiện.', 'insufficient', 'Ảnh cắt thiếu điều kiện áp dụng.'],
      ['legal', 'Điều 6 quy chế kỳ thi mô phỏng', 'Học viện Hòa Lâm hư cấu', 'Quy chế mô phỏng ghi thí sinh thuộc diện hỗ trợ tài chính được miễn lệ phí nếu nộp giấy xác nhận. Các thí sinh khác đóng mức phí công bố trên trang đăng ký.', 'refutes', 'Điều khoản dành riêng kỳ thi của học viện.'],
      ['image', 'Ảnh trang đăng ký đầy đủ', 'Phòng tuyển sinh Học viện Hòa Lâm', 'Ảnh trang đăng ký hiện hai đường: nộp phí thông thường và gửi giấy xác nhận để xin miễn. Phần chú thích dẫn đến Điều 6.', 'refutes', 'Giao diện phản ánh đợt tuyển tại ngày chụp.'],
      ['article', 'Bản tin giải đáp lệ phí', 'Báo Giáo dục Hòa Lâm mô phỏng', 'Bài báo phỏng vấn phòng tuyển sinh và ghi rõ miễn phí chỉ dành cho thí sinh đủ điều kiện hỗ trợ. Người khác vẫn cần đóng theo hướng dẫn.', 'refutes', 'Bài giải thích theo quy chế tại thời điểm đăng.'],
    ],
    explanation: 'Có quy định miễn lệ phí, nhưng chỉ cho nhóm đủ điều kiện hỗ trợ. Page đã bỏ mất điều kiện và nói thành “tất cả”.',
    questions: ['Điều 6 yêu cầu giấy tờ gì để được miễn?', 'Nếu học viện công bố quyết định miễn cho toàn bộ thí sinh, em sẽ kiểm tra hiệu lực thế nào?'],
  },
  {
    id: 'dap-an-thi-bi-lo', level: 'high', title: 'Đáp án kỳ thi đã bị lộ?', topic: 'An toàn thông tin', status: 'false',
    claim: 'Một video tuyên bố đã có đáp án chính thức kỳ thi thử Hòa Lâm, dù kỳ thi còn hai tuần nữa mới diễn ra.',
    goal: 'Kiểm tra nguồn video, thời điểm thi và tài liệu bị gắn nhãn sai.',
    sources: [
      ['video', 'Video “đáp án chính thức” và bản chép lời', 'Kênh Luyện Thi Siêu Tốc', 'Người dẫn giơ vài trang đáp án nhưng không cho thấy tên kỳ thi, mã đề hay dấu xác nhận. Phụ đề khẳng định đây là đáp án chính thức của đợt tới.', 'insufficient', 'Video tự gắn nhãn, không có nguồn gốc tài liệu.'],
      ['official', 'Thông báo của ban tổ chức mô phỏng', 'Cụm trường Hòa Lâm hư cấu', 'Ban tổ chức xác nhận chưa phát hành đề hoặc đáp án cho kỳ thi thử sắp tới. Mẫu đáp án trong video thuộc bộ luyện tập công khai năm trước.', 'refutes', 'Thông báo nói về video và kỳ thi thử này.'],
      ['image', 'Ảnh trang đầu bộ luyện tập cũ', 'Thư viện học liệu cụm trường', 'Trang đầu hiển thị “Bộ câu hỏi ôn tập 2025”, số mã luyện tập và tên đơn vị phát hành. Các trang trong video có đúng mã cũ này.', 'refutes', 'Ảnh chỉ xác định tài liệu đang bị dùng trong video.'],
      ['article', 'Bài truy nguồn clip', 'Báo Học đường Hòa Lâm mô phỏng', 'Phóng viên đối chiếu mã trang trong video với bộ luyện tập cũ công khai và hỏi ban tổ chức. Hai dấu vết cùng bác bỏ nhãn “đáp án kỳ thi sắp tới”.', 'refutes', 'Bài báo tóm tắt việc đối chiếu, cần xem tài liệu gốc.'],
    ],
    explanation: 'Trang được giơ trong video là đáp án luyện tập năm trước, không phải đáp án chính thức của kỳ thi chưa diễn ra.',
    questions: ['Mã và năm trên trang đầu tài liệu nói gì?', 'Nếu ban tổ chức sau kỳ thi công bố đáp án có cùng mã đề, em sẽ kiểm tra thêm điểm nào?'],
  },
  {
    id: 'xac-minh-ung-dung', level: 'high', title: 'Phải cài ứng dụng để dự thi?', topic: 'An toàn số', status: 'false',
    claim: 'Tin nhắn bảo mọi thí sinh kỳ thi thử Hòa Lâm phải cài ứng dụng ID Học Sinh và gửi ảnh giấy tờ trong 24 giờ.',
    goal: 'Kiểm tra yêu cầu thu thập giấy tờ với kênh tổ chức kỳ thi trước khi cung cấp dữ liệu cá nhân.',
    sources: [
      ['message', 'Tin nhắn kèm đường dẫn lạ', 'Số gửi không rõ', 'Tin nhắn thúc giục tải ứng dụng, chụp giấy tờ và gửi ngay để khỏi mất suất thi. Người gửi không nêu mã đăng ký hoặc kênh hỗ trợ chính thức.', 'insufficient', 'Đường dẫn và danh tính người gửi chưa xác thực.'],
      ['official', 'Hướng dẫn dự thi mô phỏng', 'Ban tổ chức cụm trường Hòa Lâm hư cấu', 'Hướng dẫn chỉ yêu cầu đối chiếu giấy tờ trực tiếp tại bàn thi theo danh sách trường. Ban tổ chức ghi rõ không có ứng dụng ID Học Sinh và không thu ảnh giấy tờ qua tin nhắn.', 'refutes', 'Hướng dẫn áp dụng cho kỳ thi thử của cụm trường.'],
      ['image', 'Ảnh trang cảnh báo trên bảng tin', 'Văn phòng cụm trường', 'Ảnh cảnh báo ghi đúng tên ứng dụng giả mạo và nhắc học sinh không gửi giấy tờ qua đường dẫn lạ. Bảng tin dẫn đến số điện thoại văn phòng để hỏi.', 'refutes', 'Ảnh cảnh báo cần đối chiếu tại kênh chính thức.'],
      ['article', 'Bài hướng dẫn tự bảo vệ dữ liệu', 'Báo Học đường Hòa Lâm mô phỏng', 'Bài viết nhắc học sinh hỏi ban tổ chức qua số trên thông báo gốc, không trả lời tin nhắn gây áp lực thời gian và không tải ứng dụng chưa được xác nhận.', 'context', 'Lời khuyên an toàn không tự chứng minh từng tin nhắn sai.'],
    ],
    explanation: 'Ban tổ chức mô phỏng phủ nhận ứng dụng và yêu cầu gửi ảnh giấy tờ. Tin nhắn đã giả mạo một bước dự thi để lấy dữ liệu.',
    questions: ['Tin nhắn dùng cách nào để khiến em vội làm theo?', 'Nếu ban tổ chức thật sự đổi quy trình, em cần thấy thông báo ở kênh nào trước khi gửi giấy tờ?'],
  },
  {
    id: 'ho-so-thiet-ke', level: 'high', title: 'Ngành Thiết kế nhận hồ sơ năng lực?', topic: 'Tuyển sinh', status: 'verified',
    claim: 'Trường Nghệ thuật Hòa Lâm hư cấu mở một phương thức xét hồ sơ năng lực cho ngành Thiết kế khóa 2027.',
    goal: 'Phân biệt phương thức xét tuyển bổ sung với yêu cầu chung cho mọi ngành.',
    sources: [
      ['social', 'Bài chia sẻ phương thức mới', 'Page Cộng đồng Sáng tạo', 'Page nói ngành Thiết kế có thể nộp hồ sơ năng lực, nhưng không ghi số đề án hay cách nộp. Bài cần được đối chiếu với trang tuyển sinh của trường.', 'insufficient', 'Page không nhận hồ sơ và có thể diễn giải thiếu.'],
      ['official', 'Đề án tuyển sinh 2027 mô phỏng', 'Trường Nghệ thuật Hòa Lâm hư cấu', 'Đề án ghi ngành Thiết kế có phương thức xét hồ sơ năng lực gồm sản phẩm học tập và bài tự trình bày. Đây là một phương thức bên cạnh xét điểm, không áp dụng cho mọi ngành.', 'supports', 'Áp dụng riêng ngành và khóa ghi trong đề án.'],
      ['legal', 'Phụ lục 2 của đề án mô phỏng', 'Phòng tuyển sinh Trường Nghệ thuật Hòa Lâm', 'Phụ lục nêu cấu phần hồ sơ, cách chấm và mốc nộp cho ngành Thiết kế khóa 2027. Số đề án và tên ngành khớp thông báo gốc.', 'supports', 'Phụ lục cùng nguồn với đề án, cần theo dõi bản sửa đổi.'],
      ['video', 'Buổi tư vấn và bản chép lời', 'Kênh tuyển sinh của trường hư cấu', 'Ở phút 08:15, cán bộ tuyển sinh nói xét hồ sơ năng lực là lựa chọn thêm cho ngành Thiết kế; thí sinh vẫn có thể xem các phương thức khác trong đề án.', 'supports', 'Video giải thích đề án, không thay quy định bằng văn bản.'],
    ],
    explanation: 'Đề án và phụ lục mô phỏng xác nhận ngành Thiết kế có phương thức xét hồ sơ năng lực cho khóa 2027, bên cạnh các phương thức khác.',
    questions: ['Phương thức này dành cho ngành nào và khóa nào?', 'Nếu đề án sửa mốc nộp hoặc bỏ phương thức này, em sẽ kiểm tra bản cập nhật ở đâu?'],
  },
]
export const highScenarios: Scenario[] = highSeeds.map(makeScenario)
