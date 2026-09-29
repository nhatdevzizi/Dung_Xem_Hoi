import type { EvidenceRole, Scenario, SourceType, TruthStatus } from './types'

interface SourceSeed {
  id: string
  type: SourceType
  title: string
  author: string
  publishedAt: string
  content: string
  cites?: string[]
  role: EvidenceRole
  limitation: string
  explanation: string
}

interface ScenarioSeed {
  id: string
  title: string
  learningGoal: string
  claim: string
  truthStatus: TruthStatus
  topic: string
  difficulty: string
  sources: SourceSeed[]
  hints: string[]
  teacherNotes: string
  variantClaims: [string, string]
  feedback: Scenario['feedback']
}

function scenarioFromSeed(seed: ScenarioSeed): Scenario {
  return {
    id: seed.id,
    schoolLevel: 'middle',
    title: seed.title,
    ageBand: 'Lớp 6–9',
    learningGoal: seed.learningGoal,
    claim: seed.claim,
    truthStatus: seed.truthStatus,
    topic: seed.topic,
    difficulty: seed.difficulty,
    sources: seed.sources.map(source => ({
      id: seed.id + '-' + source.id,
      type: source.type,
      title: source.title,
      author: source.author,
      publishedAt: source.publishedAt,
      content: source.content,
      citesSourceIds: (source.cites ?? []).map(id => seed.id + '-' + id),
      relevanceNote: source.explanation,
    })),
    evidenceRules: seed.sources.map(source => ({
      sourceId: seed.id + '-' + source.id,
      role: source.role,
      limitation: source.limitation,
      explanation: source.explanation,
    })),
    hints: seed.hints,
    teacherNotes: seed.teacherNotes,
    variantClaims: seed.variantClaims,
    feedback: seed.feedback,
  }
}

const seeds: ScenarioSeed[] = [
  {
    id: 'can-tin-tang-gia',
    title: 'Căn tin tăng giá tất cả món?',
    learningGoal: 'Đọc phần phạm vi trên bảng giá đầy đủ trước khi tin một ảnh chụp bị cắt.',
    claim: 'Một ảnh trong nhóm lớp nói: “Từ thứ Hai 05/10, căn tin tăng giá tất cả món ăn.” Nhiều bạn rủ nhau mang đồ ăn ở nhà vì sợ món nào cũng đắt hơn.',
    truthStatus: 'misleading',
    topic: 'Căn tin',
    difficulty: 'Dễ',
    sources: [
      {
        id: 'anh-cat', type: 'image', title: 'Ảnh cắt dòng “giá mới 25.000 đồng”', author: 'Huy trong nhóm lớp', publishedAt: '2026-10-04',
        content: 'Ảnh Huy gửi chỉ còn dòng “Giá mới từ 05/10: 25.000 đồng” và một phần hình khay thức ăn. Tên món cùng dòng ghi chú phía trên đều bị cắt mất. Huy nói mình nhận ảnh từ nhóm khác và chưa xem bảng giá đầy đủ ở căn tin.',
        cites: ['bang-day-du'], role: 'insufficient', limitation: 'Ảnh mất tên món nên không cho biết giá mới áp dụng cho món nào.',
        explanation: 'Một con số trên ảnh cắt không chứng minh mọi món đều tăng giá.',
      },
      {
        id: 'bang-day-du', type: 'official', title: 'Bảng giá đầy đủ của căn tin', author: 'Ban quản lý căn tin Sao Mai', publishedAt: '2026-10-03',
        content: 'Bảng giá ghi rõ từ thứ Hai 05/10 combo bữa trưa đổi từ 22.000 lên 25.000 đồng vì thêm trái cây. Các món lẻ như bún, cơm và bánh mì vẫn giữ giá đang niêm yết. Dòng giá mới trong ảnh được cắt từ mục combo, không nằm ở đầu toàn bảng.',
        role: 'refutes', limitation: 'Bảng này áp dụng từ 05/10; cần xem bản cập nhật nếu căn tin đổi giá sau đó.',
        explanation: 'Bảng gốc giới hạn thay đổi vào combo bữa trưa, phản bác chữ “tất cả món”.',
      },
      {
        id: 'ban-nhan', type: 'message', title: 'Tin nhắn của bạn cùng lớp', author: 'Linh, học sinh lớp 7A', publishedAt: '2026-10-04',
        content: 'Linh nhắn: “Mọi người bảo căn tin tăng giá hết, chắc mai mình mang cơm nhà.” Khi được hỏi, Linh cho biết chỉ xem ảnh Huy chuyển tiếp và chưa hỏi người bán hay đọc bảng niêm yết. Tin của Linh cho thấy lời đồn lan nhanh nhưng không bổ sung nguồn độc lập.',
        cites: ['anh-cat'], role: 'insufficient', limitation: 'Linh dẫn lại ảnh cắt, không kiểm tra bảng giá gốc.',
        explanation: 'Lời bạn kể lại không làm tuyên bố về tất cả món đáng tin hơn.',
      },
      {
        id: 'menu-mon-le', type: 'official', title: 'Menu món lẻ tuần 05/10', author: 'Quầy món lẻ căn tin Sao Mai', publishedAt: '2026-10-04',
        content: 'Menu treo tại quầy cho tuần bắt đầu 05/10 ghi bún 20.000 đồng, bánh mì 15.000 đồng và cơm lẻ 22.000 đồng. Giá từng món bằng bảng tuần trước; ghi chú cuối trang chỉ dẫn học sinh xem mục combo riêng nếu mua trọn bữa có trái cây.',
        role: 'refutes', limitation: 'Menu chỉ liệt kê một số món lẻ, không tự nói về mọi lựa chọn trong căn tin.',
        explanation: 'Giá món lẻ không đổi, phù hợp phần giải thích trên bảng giá đầy đủ.',
      },
      {
        id: 'bien-lai', type: 'article', title: 'Biên lai bún ngày 05/10', author: 'Mai, học sinh lớp 8B', publishedAt: '2026-10-05',
        content: 'Mai giữ biên lai mua một tô bún ở quầy món lẻ ngày 05/10 với giá 20.000 đồng, bằng số tiền bạn đã trả tuần trước. Biên lai có ngày và tên món, nhưng chỉ phản ánh một lần mua; để hiểu toàn bộ chính sách phải xem bảng giá của căn tin.',
        role: 'context', limitation: 'Một biên lai chỉ xác nhận giá của một món ở một thời điểm.',
        explanation: 'Biên lai là dấu hiệu bổ trợ rằng món lẻ này không tăng giá.',
      },
      {
        id: 'nhan-vien', type: 'message', title: 'Câu trả lời của nhân viên căn tin', author: 'Cô Lan, phụ trách quầy căn tin', publishedAt: '2026-10-05',
        content: 'Khi nhóm trực nhật hỏi lại, cô Lan chỉ vào bảng giá và nói: “Chúng tôi thêm trái cây vào combo trưa nên giá combo là 25.000 đồng. Món lẻ vẫn bán theo menu cũ.” Cô đề nghị xem tên mục trên bảng thay vì chỉ nhìn dòng giá trong ảnh cắt.',
        role: 'refutes', limitation: 'Lời giải thích áp dụng cho bảng giá tuần 05/10, không bảo đảm các tuần sau giữ nguyên.',
        explanation: 'Người phụ trách xác nhận chính xác phần nào tăng và phần nào không.',
      },
    ],
    hints: [
      'Ảnh được chụp đủ cả tên mục và ghi chú chưa?',
      'Tìm bảng giá đầy đủ có ngày hiệu lực 05/10.',
      'So giá combo với giá món lẻ; hai loại có giống nhau không?',
    ],
    teacherNotes: 'Cho học sinh đọc ảnh cắt trước, sau đó mở bảng giá gốc và menu món lẻ. Tin dùng cụm “tất cả món” để mở rộng một thay đổi chỉ dành cho combo trưa. Biên lai là đối chiếu bổ trợ nhưng không thay bảng niêm yết.',
    variantClaims: [
      'Nghe nói từ 05/10 món nào trong căn tin Sao Mai cũng tăng giá, vì một ảnh ghi giá mới 25.000 đồng.',
      'Ảnh được chia sẻ trong lớp khẳng định căn tin tăng đồng loạt giá tất cả món từ thứ Hai 05/10.',
    ],
    feedback: {
      explanation: 'Căn tin chỉ tăng giá combo trưa có thêm trái cây. Bảng giá đầy đủ và menu món lẻ cho thấy các món bán riêng vẫn giữ giá, nên tin “tất cả món” gây hiểu lầm.',
      questions: [
        'Dòng “25.000 đồng” trong ảnh cắt có cho biết món nào đổi giá không?',
        'Nếu bảng giá mới ghi rõ mọi món đều tăng từ 05/10, bạn sẽ đổi lựa chọn thế nào?',
      ],
    },
  },
  {
    id: 'clb-lap-trinh',
    title: 'Câu lạc bộ lập trình còn nhận đơn?',
    learningGoal: 'Đối chiếu thời hạn đăng ký của thông báo hiện tại với biểu mẫu và tin cũ.',
    claim: 'Một bạn nhắn rằng Câu lạc bộ Lập trình Sao Mai đang nhận đăng ký cho học sinh khối 7–9 đến hết thứ Sáu 09/10/2026. Bạn muốn tham gia nhưng chưa rõ tin có đúng không.',
    truthStatus: 'verified',
    topic: 'Câu lạc bộ',
    difficulty: 'Dễ',
    sources: [
      {
        id: 'thong-bao', type: 'official', title: 'Thông báo tuyển thành viên tháng 10', author: 'Ban phụ trách câu lạc bộ Sao Mai', publishedAt: '2026-10-02',
        content: 'Thông báo niêm yết ở bảng hoạt động ghi Câu lạc bộ Lập trình nhận đơn của học sinh khối 7, 8 và 9 đến 17:00 thứ Sáu 09/10/2026. Buổi sinh hoạt đầu diễn ra tuần sau. Học sinh nộp phiếu giấy tại phòng hoạt động, không cần gửi thông tin qua tài khoản cá nhân.',
        role: 'supports', limitation: 'Thời hạn chỉ đúng cho đợt tuyển tháng 10/2026.',
        explanation: 'Thông báo gốc xác nhận cả đối tượng và hạn cuối 09/10.',
      },
      {
        id: 'phieu-dang-ky', type: 'official', title: 'Phiếu đăng ký tại phòng hoạt động', author: 'Phòng hoạt động học sinh', publishedAt: '2026-10-05',
        content: 'Trên phiếu giấy đặt tại phòng hoạt động có dòng “Nộp trước 17:00 ngày 09/10/2026” và ô chọn khối 7, 8 hoặc 9. Người trực phòng nói mỗi học sinh chỉ cần một phiếu. Phiếu được phát cùng đợt thông báo tuyển thành viên đang niêm yết.',
        cites: ['thong-bao'], role: 'supports', limitation: 'Phiếu thuộc cùng đợt tuyển và cùng nguồn tổ chức với thông báo.',
        explanation: 'Biểu mẫu đang phát khớp ngày cuối và đối tượng trên thông báo.',
      },
      {
        id: 'ban-nhan', type: 'message', title: 'Tin nhắn của An trong nhóm lớp', author: 'An, học sinh lớp 8A', publishedAt: '2026-10-05',
        content: 'An nhắn rằng câu lạc bộ còn nhận đơn đến thứ Sáu và gửi ảnh bảng hoạt động. An chưa tự nộp phiếu, chỉ chuyển tiếp ảnh cho những bạn quan tâm. Tin nhắn giúp biết có thông báo để tìm, nhưng bản thân An không phải người phụ trách tuyển thành viên.',
        cites: ['thong-bao'], role: 'insufficient', limitation: 'An chỉ dẫn lại thông báo, không phải nguồn xác nhận độc lập.',
        explanation: 'Tin của bạn gợi nơi kiểm tra nhưng cần xem thông báo gốc.',
      },
      {
        id: 'poster-cu', type: 'image', title: 'Poster tuyển thành viên năm 2025', author: 'Câu lạc bộ Lập trình Sao Mai', publishedAt: '2025-09-25',
        content: 'Poster có màu và biểu tượng giống đợt hiện tại nhưng ghi thời hạn nộp đơn là 03/10/2025 cho khối 8–9. Một góc ảnh bị che khi được chia sẻ lại, khiến vài bạn tưởng hạn đăng ký năm nay đã qua. Ngày năm 2025 vẫn hiện ở mép dưới bản đầy đủ.',
        role: 'context', limitation: 'Poster cũ không cho biết thời hạn của đợt 2026.',
        explanation: 'Ngày trên poster cũ giải thích vì sao có lời kể hạn đăng ký khác nhau.',
      },
      {
        id: 'lich-hoat-dong', type: 'schedule', title: 'Lịch phòng câu lạc bộ tuần 12/10', author: 'Tổ quản lý phòng học', publishedAt: '2026-10-03',
        content: 'Lịch đặt phòng ghi một buổi làm quen của Câu lạc bộ Lập trình vào tuần bắt đầu 12/10. Bảng chỉ nói khi nào phòng được dùng và không nêu ai được đăng ký hoặc hạn nộp đơn. Nó phù hợp với kế hoạch mở câu lạc bộ nhưng không tự xác nhận ngày 09/10.',
        role: 'context', limitation: 'Lịch phòng không phải thông báo tuyển thành viên.',
        explanation: 'Lịch bổ sung bối cảnh, còn hạn đăng ký phải lấy từ thông báo tuyển.',
      },
      {
        id: 'co-phu-trach', type: 'message', title: 'Cô phụ trách trả lời tại bảng tin', author: 'Cô Thu, giáo viên phụ trách câu lạc bộ', publishedAt: '2026-10-06',
        content: 'Khi học sinh hỏi trực tiếp, cô Thu chỉ vào thông báo tháng 10 và nói: “Các em khối 7 đến 9 vẫn nộp phiếu được đến 17 giờ thứ Sáu 09/10.” Cô nhắc không dùng poster năm trước để tính hạn và sẽ nhận phiếu tại phòng hoạt động.',
        role: 'supports', limitation: 'Câu trả lời nói về đợt tuyển hiện tại; lịch có thể được cập nhật bằng thông báo mới.',
        explanation: 'Người phụ trách xác nhận hạn nộp và nơi nộp đúng như thông báo.',
      },
    ],
    hints: [
      'Tìm thông báo tuyển của đúng năm 2026.',
      'Phiếu đang phát ghi hạn nộp đến ngày nào?',
      'Poster năm trước có áp dụng cho đợt hiện tại không?',
    ],
    teacherNotes: 'Cho học sinh so poster năm 2025 với thông báo 2026, sau đó đọc hạn trên phiếu giấy và câu trả lời của cô phụ trách. Tin nhắn của An chỉ dẫn lại ảnh. Mấu chốt là ngày cuối 09/10 và phạm vi khối 7–9.',
    variantClaims: [
      'Có tin Câu lạc bộ Lập trình Sao Mai nhận phiếu khối 7–9 đến 17 giờ ngày 09/10/2026.',
      'Bạn An nói vẫn có thể đăng ký Câu lạc bộ Lập trình trước thứ Sáu 09/10 năm nay.',
    ],
    feedback: {
      explanation: 'Thông báo tháng 10 và phiếu đang phát cùng ghi hạn 17:00 ngày 09/10 cho khối 7–9. Cô phụ trách cũng xác nhận trực tiếp; poster năm trước không thay được nguồn mới.',
      questions: [
        'Vì sao poster năm 2025 không đủ để quyết định hạn đăng ký năm nay?',
        'Nếu thông báo mới rút hạn xuống ngày 07/10, bạn sẽ đổi lựa chọn thế nào?',
      ],
    },
  },
  {
    id: 'giai-bong-ro',
    title: 'Giải bóng rổ đã chuyển vào nhà?',
    learningGoal: 'Tách dự báo thời tiết và ảnh cũ khỏi quyết định đổi địa điểm của ban tổ chức.',
    claim: 'Trong nhóm thể thao có tin: “Giải bóng rổ khối 7 thứ Bảy 10/10/2026 đã chuyển vào nhà thi đấu vì trời sắp mưa.” Bạn cần biết đến đâu để cổ vũ đúng chỗ.',
    truthStatus: 'false',
    topic: 'Hoạt động thể thao',
    difficulty: 'Vừa',
    sources: [
      {
        id: 'tin-chuyen', type: 'message', title: 'Tin chuyển tiếp trong nhóm thể thao', author: 'Tài khoản Bóng Cam', publishedAt: '2026-10-08',
        content: 'Tin nhắn ghi rằng trận bóng rổ khối 7 đã chuyển vào nhà thi đấu và khuyên mọi người khỏi đến sân A. Người gửi chỉ nói “nghe bên đội khác báo” và đính kèm ảnh một trận trong nhà. Không có tên người tổ chức, số thông báo hoặc ngày chụp ảnh.',
        cites: ['anh-cu'], role: 'insufficient', limitation: 'Người gửi dựa trên lời kể và ảnh chưa xác định năm.',
        explanation: 'Tin chuyển tiếp là nơi phát sinh lời đồn, chưa phải quyết định đổi sân.',
      },
      {
        id: 'anh-cu', type: 'image', title: 'Ảnh trận bóng trong nhà năm trước', author: 'Câu lạc bộ ảnh Sao Mai', publishedAt: '2025-10-10',
        content: 'Ảnh cho thấy đội bóng chơi trong nhà thi đấu với băng rôn giải khối 7. Bản đầy đủ ở album trường ghi ngày 10/10/2025; khi chia sẻ lại, phần chú thích năm bị bỏ. Ảnh chứng minh đã có trận trong nhà năm trước, không chứng minh địa điểm của giải 2026.',
        role: 'context', limitation: 'Ảnh thuộc mùa giải 2025, không phải lịch hiện tại.',
        explanation: 'Bối cảnh ảnh cũ giải thích vì sao tin đổi sân nghe có vẻ thật.',
      },
      {
        id: 'lich-moi', type: 'official', title: 'Lịch thi đấu cập nhật 08/10', author: 'Ban tổ chức giải thể thao Sao Mai', publishedAt: '2026-10-08',
        content: 'Lịch thi đấu phiên bản ngày 08/10 ghi các trận khối 7 vào thứ Bảy 10/10 tại sân A ngoài trời. Góc cuối có dòng: “Nếu thời tiết xấu, ban tổ chức sẽ thông báo thay đổi trước 7 giờ sáng ngày thi đấu.” Chưa có dòng chuyển sang nhà thi đấu.',
        role: 'refutes', limitation: 'Lịch có thể được thay bằng thông báo mới nếu trời xấu vào ngày thi đấu.',
        explanation: 'Lịch hiện hành vẫn chỉ sân A, phản bác câu “đã chuyển vào nhà”.',
      },
      {
        id: 'huan-luyen', type: 'message', title: 'Thầy huấn luyện trả lời', author: 'Thầy Phúc, phụ trách đội khối 7', publishedAt: '2026-10-08',
        content: 'Khi học sinh hỏi nơi tập trung, thầy Phúc trả lời: “Đến sân A theo lịch 08/10. Ban tổ chức chưa chuyển địa điểm; nếu mưa thật sẽ báo trước 7 giờ sáng thứ Bảy.” Thầy nhắc các đội theo dõi kênh của ban tổ chức thay vì tin ảnh trận cũ.',
        role: 'refutes', limitation: 'Câu trả lời đúng tại 08/10, chưa quyết định thay cho sáng 10/10.',
        explanation: 'Người phụ trách xác nhận chưa có quyết định chuyển vào nhà.',
      },
      {
        id: 'du-bao', type: 'article', title: 'Bản tin thời tiết cho cuối tuần', author: 'Bảng thông tin thời tiết mô phỏng', publishedAt: '2026-10-08',
        content: 'Bản tin dự báo khả năng có mưa rào chiều thứ Bảy quanh khu vực trường. Nó không nói sáng 10/10 chắc chắn mưa và cũng không do ban tổ chức giải phát hành. Dự báo giúp chuẩn bị phương án dự phòng, nhưng không tự thay đổi địa điểm đã công bố.',
        role: 'context', limitation: 'Dự báo có độ bất định và không phải quyết định tổ chức.',
        explanation: 'Có khả năng mưa không đồng nghĩa ban tổ chức đã đổi sân.',
      },
      {
        id: 'dat-san', type: 'schedule', title: 'Bảng đặt nhà thi đấu ngày 10/10', author: 'Tổ quản lý cơ sở vật chất', publishedAt: '2026-10-08',
        content: 'Bảng đặt nhà thi đấu cho sáng 10/10 ghi buổi tập bóng chuyền khối 9, còn sân A được dành cho giải bóng rổ khối 7. Bảng đặt sân là kế hoạch hỗ trợ, có thể điều chỉnh nếu mưa, nhưng tại thời điểm đăng chưa có chỗ trong nhà cho giải bóng rổ.',
        role: 'refutes', limitation: 'Bảng đặt sân có thể được sửa nếu ban tổ chức ra quyết định mới.',
        explanation: 'Phân bổ địa điểm hiện tại phù hợp lịch thi đấu ngoài trời.',
      },
    ],
    hints: [
      'Ảnh trận trong nhà được chụp năm nào?',
      'Lịch thi đấu mới nhất ghi sân nào cho ngày 10/10?',
      'Dự báo mưa có phải là thông báo đổi địa điểm không?',
    ],
    teacherNotes: 'Đường kiểm chứng là lịch thi đấu 08/10 và xác nhận của thầy phụ trách. Ảnh trận năm 2025 và dự báo mưa tạo vẻ hợp lý cho tin đồn, nhưng không chứng minh ban tổ chức đã ra quyết định. Nhấn mạnh tính tạm thời của lịch nếu sau đó có thông báo mới.',
    variantClaims: [
      'Có người bảo giải bóng rổ khối 7 ngày 10/10/2026 sẽ chơi trong nhà thi đấu thay vì sân A.',
      'Nhóm thể thao lan tin ban tổ chức đã đổi giải bóng rổ thứ Bảy sang sân trong nhà vì dự báo mưa.',
    ],
    feedback: {
      explanation: 'Lịch hiện hành và thầy phụ trách đều nói giải vẫn ở sân A; ban tổ chức chưa chuyển địa điểm. Dự báo mưa chỉ là khả năng, còn ảnh trận trong nhà thuộc năm 2025.',
      questions: [
        'Ảnh một trận năm trước có thể thay lịch thi đấu hiện tại không?',
        'Nếu sáng 10/10 ban tổ chức đăng thông báo chuyển sân, bạn sẽ đổi lựa chọn thế nào?',
      ],
    },
  },
  {
    id: 'xe-dua-don',
    title: 'Xe tuyến Xanh có điểm dừng mới?',
    learningGoal: 'Kiểm tra ngày hiệu lực và đúng tuyến trước khi dựa vào lời kể về xe đưa đón.',
    claim: 'Bạn nghe rằng từ thứ Hai 05/10/2026, xe đưa đón tuyến Xanh sẽ đón học sinh tại cổng thư viện lúc 7:15. Lịch cũ của tuyến không có điểm dừng này.',
    truthStatus: 'verified',
    topic: 'Xe đưa đón',
    difficulty: 'Vừa',
    sources: [
      {
        id: 'lich-tuyen-moi', type: 'schedule', title: 'Lịch tuyến Xanh từ 05/10', author: 'Bộ phận xe đưa đón Sao Mai', publishedAt: '2026-10-02',
        content: 'Bảng lịch mới ghi tuyến Xanh từ thứ Hai 05/10 có điểm dừng “cổng thư viện” lúc 7:15, trước khi xe đến cổng trường. Đầu trang ghi mã tuyến và ngày hiệu lực, cuối trang nhắc học sinh có mặt sớm năm phút. Các tuyến Đỏ và Vàng không đổi.',
        role: 'supports', limitation: 'Chỉ xác nhận tuyến Xanh và lịch bắt đầu từ 05/10.',
        explanation: 'Lịch đúng tuyến và đúng ngày xác nhận điểm đón mới.',
      },
      {
        id: 'thong-bao', type: 'official', title: 'Thông báo thêm điểm đón', author: 'Văn phòng vận hành trường', publishedAt: '2026-10-02',
        content: 'Văn phòng thông báo thử thêm điểm đón cổng thư viện cho tuyến Xanh từ 05/10 để giảm thời gian chờ ở cổng trường. Giờ đón là 7:15 và học sinh vẫn dùng thẻ xe hiện tại. Thông báo không nói mọi tuyến đều dừng ở cổng thư viện.',
        role: 'supports', limitation: 'Thông báo cho giai đoạn thử nghiệm; có thể có lịch mới sau đó.',
        explanation: 'Văn phòng xác nhận lý do, giờ và phạm vi của thay đổi.',
      },
      {
        id: 'lich-cu', type: 'schedule', title: 'Lịch tuyến Xanh tháng 9', author: 'Bộ phận xe đưa đón Sao Mai', publishedAt: '2026-09-01',
        content: 'Lịch tháng 9 liệt kê ba điểm đón của tuyến Xanh và không có cổng thư viện. Bản này được ghim từ đầu năm học và có ghi chú sẽ thay khi văn phòng công bố lịch mới. Nó cho biết trước đây xe không dừng ở đó, không bác được thay đổi tháng 10.',
        role: 'context', limitation: 'Lịch cũ hết giá trị cho thay đổi có hiệu lực từ 05/10.',
        explanation: 'Sự khác nhau giữa lịch cũ và lịch mới là điều học sinh cần nhận ra.',
      },
      {
        id: 'ban-nhan', type: 'message', title: 'Bạn đi tuyến Xanh nhắn lại', author: 'Duy, học sinh lớp 7C', publishedAt: '2026-10-03',
        content: 'Duy nhắn rằng tuần sau xe tuyến Xanh có thể đón ở cổng thư viện và rủ bạn ra điểm mới. Duy nói đã đọc một tờ thông báo dán ở xe nhưng chưa chụp lại. Lời bạn giúp biết nơi tìm nguồn, nhưng phải xem lịch có mã tuyến và ngày rõ ràng.',
        cites: ['thong-bao'], role: 'insufficient', limitation: 'Duy chỉ kể lại thông báo, không phải nguồn gốc độc lập.',
        explanation: 'Lời kể chưa đủ nếu học sinh chưa xác định đúng tuyến và giờ.',
      },
      {
        id: 'bien-diem-don', type: 'image', title: 'Biển điểm đón cổng thư viện', author: 'Nhóm quản lý xe đưa đón', publishedAt: '2026-10-04',
        content: 'Biển tạm ở cổng thư viện ghi “Tuyến Xanh – 7:15 – bắt đầu 05/10/2026” và hướng dẫn xếp hàng trong sân chờ. Ảnh cho thấy một dấu hiệu tại địa điểm, nhưng học sinh vẫn nên đối chiếu với lịch tuyến để tránh nhầm biển của một ngày thử xe.',
        role: 'supports', limitation: 'Biển có thể được tháo hoặc thay nếu giai đoạn thử nghiệm kết thúc.',
        explanation: 'Biển tại điểm đón khớp thông tin tuyến Xanh trong lịch mới.',
      },
      {
        id: 'tuyen-do', type: 'article', title: 'Bài hỏi về tuyến Đỏ', author: 'Nhóm phụ huynh tuyến Đỏ mô phỏng', publishedAt: '2026-10-03',
        content: 'Một bài trong nhóm phụ huynh hỏi liệu tuyến Đỏ có dừng ở cổng thư viện không. Người trả lời cho biết lịch Đỏ chưa đổi và nhắc xem mã tuyến trên từng thông báo. Bài không phản bác việc tuyến Xanh thêm điểm, chỉ cho thấy không nên suy rộng sang mọi xe.',
        role: 'context', limitation: 'Thông tin nói về tuyến Đỏ, không tự xác nhận lịch tuyến Xanh.',
        explanation: 'Bối cảnh giúp giữ đúng phạm vi của lời đồn.',
      },
    ],
    hints: [
      'Tin nói về tuyến xe nào và ngày bắt đầu nào?',
      'Tìm lịch có mã tuyến Xanh thay vì lịch ghim tháng 9.',
      'Điểm đón mới có giờ rõ trên nguồn của bộ phận xe không?',
    ],
    teacherNotes: 'Cho học sinh đặt lịch tháng 9 cạnh lịch có hiệu lực 05/10, khoanh tên tuyến Xanh và giờ 7:15. Thông báo vận hành và biển điểm đón hỗ trợ lịch mới; bài hỏi tuyến Đỏ là bài học về phạm vi áp dụng. Không dùng lịch cũ để bác lịch mới.',
    variantClaims: [
      'Nghe nói xe tuyến Xanh đón thêm ở cổng thư viện lúc 7:15 từ tuần bắt đầu 05/10/2026.',
      'Một bạn đi xe bảo tuyến Xanh có điểm dừng mới tại cổng thư viện từ thứ Hai 05/10.',
    ],
    feedback: {
      explanation: 'Lịch mới, thông báo vận hành và biển tại điểm đón đều ghi tuyến Xanh dừng ở cổng thư viện lúc 7:15 từ 05/10. Lịch tháng 9 cũ không bác thay đổi này.',
      questions: [
        'Nếu chỉ xem lịch tháng 9, bạn có bỏ lỡ ngày hiệu lực mới không?',
        'Nếu thông báo mới chỉ áp dụng tuyến Đỏ, bạn sẽ đánh giá lại tin về tuyến Xanh thế nào?',
      ],
    },
  },
  {
    id: 'do-that-lac',
    title: 'Ai cũng được lấy đồ thất lạc?',
    learningGoal: 'Kiểm tra quy trình nhận đồ trước khi làm theo lời rủ từ ảnh và tin nhắn.',
    claim: 'Một tin trong lớp nói: “Chiều thứ Sáu 09/10, phòng bảo vệ cho ai đến cũng lấy đồ thất lạc, không cần mô tả món đồ hay xác nhận là của mình.”',
    truthStatus: 'false',
    topic: 'Đồ thất lạc',
    difficulty: 'Dễ',
    sources: [
      {
        id: 'tin-rumor', type: 'message', title: 'Tin rủ đến nhận đồ', author: 'Tài khoản Mực Tím trong nhóm lớp', publishedAt: '2026-10-08',
        content: 'Tài khoản Mực Tím gửi ảnh kệ đồ thất lạc và viết: “Thứ Sáu ai thích gì cứ lấy, bảo vệ đang dọn kho.” Người gửi không nói đã hỏi ai hoặc kệ nằm ở khu nào. Một số bạn chuyển tiếp nguyên văn và thêm câu “không cần chứng minh”.',
        cites: ['anh-ke'], role: 'insufficient', limitation: 'Tin nhắn không nêu nguồn có quyền cho phép nhận đồ.',
        explanation: 'Lời rủ xuất phát từ ảnh kệ, chưa phải quy trình do trường công bố.',
      },
      {
        id: 'anh-ke', type: 'image', title: 'Ảnh kệ đồ ở phòng bảo vệ', author: 'Một học sinh không ghi tên', publishedAt: '2026-10-08',
        content: 'Ảnh cho thấy ô, bình nước và áo khoác trên một kệ gần phòng bảo vệ. Không có tờ giấy nào trong khung hình nói học sinh được tự chọn đồ mang đi. Kệ chỉ là nơi tạm giữ đồ thất lạc, nên ảnh không chứng minh quy định nhận lại đồ.',
        role: 'context', limitation: 'Ảnh không cho thấy quy trình hoặc quyền sở hữu đồ vật.',
        explanation: 'Kệ tồn tại nhưng không biến đồ của người khác thành đồ ai cũng được lấy.',
      },
      {
        id: 'quy-trinh', type: 'official', title: 'Quy trình nhận lại đồ thất lạc', author: 'Văn phòng Trường Sao Mai', publishedAt: '2026-09-15',
        content: 'Thông báo đang niêm yết ghi người nhận phải mô tả đặc điểm món đồ, ngày và nơi đánh rơi, sau đó ký vào sổ nhận. Với đồ giá trị cao, giáo viên chủ nhiệm cùng xác minh thêm. Quy trình áp dụng cả chiều thứ Sáu 09/10; trường không tổ chức buổi phát đồ tự do.',
        role: 'refutes', limitation: 'Quy trình có thể được cập nhật, nhưng chưa có thông báo thay thế cho ngày 09/10.',
        explanation: 'Văn bản yêu cầu xác minh trước khi trả đồ, trái với tin “ai cũng lấy”.',
      },
      {
        id: 'bao-ve', type: 'message', title: 'Bác bảo vệ giải thích', author: 'Bác Nam, trực phòng bảo vệ', publishedAt: '2026-10-08',
        content: 'Khi được hỏi, bác Nam nói kệ sẽ được sắp xếp lại vào chiều thứ Sáu, còn đồ vẫn trả theo quy trình mô tả và ký sổ. Bác không cho người đến tự chọn đồ vì có thể lấy nhầm tài sản của bạn khác. Học sinh có thể nhờ giáo viên đi cùng nếu cần.',
        role: 'refutes', limitation: 'Lời bác Nam phản ánh ca trực và quy trình hiện tại.',
        explanation: 'Người phụ trách kệ xác nhận việc dọn kho không phải phát đồ tự do.',
      },
      {
        id: 'so-nhan', type: 'article', title: 'Mẫu trang sổ nhận đồ', author: 'Phòng bảo vệ Trường Sao Mai', publishedAt: '2026-10-08',
        content: 'Trang mẫu trong sổ có các cột mô tả món đồ, nơi tìm thấy, đặc điểm người nhận nêu và chữ ký sau khi đối chiếu. Trang không chứa dữ liệu học sinh thật trong bản demo. Mẫu sổ cho thấy mỗi đồ vật cần được ghép với người mất, không phát ngẫu nhiên.',
        role: 'refutes', limitation: 'Mẫu sổ minh họa quy trình, không tự chứng minh từng lần trả đồ được làm đúng.',
        explanation: 'Sổ là bằng chứng bổ trợ về bước đối chiếu trước khi giao đồ.',
      },
      {
        id: 'ban-tin-cu', type: 'social', title: 'Bài đăng tái sử dụng đồ cũ năm 2025', author: 'Câu lạc bộ Sống Xanh Sao Mai', publishedAt: '2025-10-09',
        content: 'Bài đăng năm trước mời học sinh nhận sách và hộp bút đã được chủ cũ đồng ý tặng lại trong một buổi trao đổi. Nó không nói về kệ đồ thất lạc năm 2026. Ảnh của bài cũ có cùng góc phòng, nên dễ bị nhầm với tin dọn kho tuần này.',
        role: 'context', limitation: 'Sự kiện tặng đồ cũ khác hẳn việc trả đồ thất lạc cho chủ sở hữu.',
        explanation: 'Một sự kiện trao đổi năm trước không thay đổi quy trình nhận đồ hiện tại.',
      },
    ],
    hints: [
      'Ảnh kệ có ghi ai được lấy đồ không?',
      'Tìm quy trình hiện hành của văn phòng trường.',
      'Dọn lại kệ và phát đồ tự do có phải cùng một việc không?',
    ],
    teacherNotes: 'Cho học sinh phân biệt đồ thất lạc còn chủ sở hữu với đồ đã được tặng để tái sử dụng. Tin đồn lấy việc dọn kệ chiều thứ Sáu làm bằng chứng cho quyền tự chọn đồ. Quy trình niêm yết và xác nhận của bác bảo vệ phản bác trực tiếp.',
    variantClaims: [
      'Nghe nói chiều 09/10 phòng bảo vệ mở kệ đồ thất lạc cho học sinh tự lấy, khỏi cần chứng minh đồ của mình.',
      'Ảnh kệ đồ trong nhóm khiến nhiều bạn tin thứ Sáu ai đến trước cũng có thể mang đồ thất lạc về.',
    ],
    feedback: {
      explanation: 'Phòng bảo vệ chỉ sắp xếp lại kệ. Quy trình của trường vẫn yêu cầu mô tả món đồ, đối chiếu và ký sổ trước khi nhận, nên lời rủ “ai cũng lấy” là sai.',
      questions: [
        'Một ảnh chụp kệ đồ có thể cho biết ai sở hữu từng món không?',
        'Nếu trường công bố riêng một buổi trao đổi đồ đã được chủ cũ đồng ý tặng, kết luận về buổi đó sẽ khác thế nào?',
      ],
    },
  },
  {
    id: 'ngay-hoi-khoa-hoc',
    title: 'Ngày hội khoa học thu phí vào cửa?',
    learningGoal: 'Phân biệt vé vào sự kiện miễn phí với chi phí vật liệu của một hoạt động tùy chọn.',
    claim: 'Một ảnh tờ rơi khiến nhiều bạn tin rằng phải trả 30.000 đồng mới được vào Ngày hội Khoa học của trường ngày 10/10/2026.',
    truthStatus: 'misleading',
    topic: 'Sự kiện trường',
    difficulty: 'Vừa',
    sources: [
      {
        id: 'anh-cat', type: 'image', title: 'Ảnh cắt dòng “30.000 đồng”', author: 'Tài khoản Sao Chổi trong nhóm lớp', publishedAt: '2026-10-06',
        content: 'Ảnh chỉ cho thấy dòng “Bộ vật liệu: 30.000 đồng” và hình cổng ngày hội. Phần tiêu đề phía trên cùng chú thích “tự chọn” phía dưới bị cắt mất. Người chia sẻ viết thêm “chắc phải mua vé vào cửa” nhưng chưa mở tờ rơi đầy đủ.',
        cites: ['to-roi'], role: 'insufficient', limitation: 'Ảnh bị cắt mất tên khoản phí và điều kiện tự chọn.',
        explanation: 'Dòng tiền trên ảnh không tự chứng minh có vé vào cổng.',
      },
      {
        id: 'to-roi', type: 'official', title: 'Tờ rơi đầy đủ Ngày hội Khoa học', author: 'Ban tổ chức Ngày hội Khoa học', publishedAt: '2026-10-05',
        content: 'Tờ rơi ghi sự kiện diễn ra ngày 10/10/2026 tại sân trường và miễn phí vào cửa cho học sinh, phụ huynh. Khoản 30.000 đồng chỉ dành cho người tự chọn tham gia góc lắp mô hình có bộ vật liệu mang về. Các khu trưng bày và thí nghiệm chung không thu phí.',
        role: 'refutes', limitation: 'Tờ rơi áp dụng cho ngày hội 10/10; hoạt động khác có thể có quy định riêng.',
        explanation: 'Bản đầy đủ cho thấy 30.000 đồng là phí vật liệu tùy chọn, không phải vé vào cổng.',
      },
      {
        id: 'ban-nhan', type: 'message', title: 'Tin nhắn rủ góp tiền', author: 'Thảo, học sinh lớp 8B', publishedAt: '2026-10-06',
        content: 'Thảo nhắn cả nhóm chuẩn bị 30.000 đồng vì bạn muốn mọi người cùng lắp mô hình. Khi được hỏi, Thảo nói đã xem ảnh cắt và tưởng ai cũng phải tham gia hoạt động này. Tin nhắn thể hiện dự định của nhóm bạn, không phải thông báo chung của ban tổ chức.',
        cites: ['anh-cat'], role: 'insufficient', limitation: 'Bạn học suy từ ảnh cắt và nguyện vọng riêng của nhóm.',
        explanation: 'Rủ góp tiền cho góc mô hình không chứng minh ngày hội thu phí vào cửa.',
      },
      {
        id: 'lich-khu', type: 'schedule', title: 'Sơ đồ các khu của ngày hội', author: 'Nhóm điều phối sự kiện', publishedAt: '2026-10-07',
        content: 'Sơ đồ chia sân trường thành khu trưng bày, khu thí nghiệm chung và góc lắp mô hình. Chỉ góc lắp mô hình có quầy phát bộ vật liệu đã đăng ký. Lối vào chính dẫn thẳng đến khu trưng bày, không có bàn bán vé hoặc điểm thu tiền ở cổng.',
        role: 'context', limitation: 'Sơ đồ hỗ trợ cách tổ chức, còn quy định phí cần đọc tờ rơi và thông báo.',
        explanation: 'Sơ đồ phù hợp việc vào cửa miễn phí và chỉ trả tiền cho góc tự chọn.',
      },
      {
        id: 'xac-nhan', type: 'message', title: 'Ban tổ chức trả lời câu hỏi', author: 'Cô Vân, điều phối Ngày hội Khoa học', publishedAt: '2026-10-07',
        content: 'Cô Vân trả lời: “Các em và phụ huynh vào xem ngày hội không phải trả phí. Nếu muốn nhận bộ vật liệu ở góc lắp mô hình, các em đăng ký trước và nộp 30.000 đồng cho bộ đó.” Cô nhắc cả lớp chia sẻ bản tờ rơi đầy đủ để tránh hiểu nhầm.',
        role: 'refutes', limitation: 'Lời cô nói về ngày hội trường tổ chức ngày 10/10.',
        explanation: 'Người điều phối xác nhận tiền chỉ gắn với hoạt động tự chọn.',
      },
      {
        id: 'phieu-vat-lieu', type: 'article', title: 'Phiếu đăng ký bộ vật liệu', author: 'Góc lắp mô hình Sao Mai', publishedAt: '2026-10-07',
        content: 'Phiếu ghi mỗi bộ vật liệu giá 30.000 đồng, gồm giấy, pin nhỏ và linh kiện mô hình; ô đăng ký có chữ “không bắt buộc”. Học sinh không đăng ký vẫn có thể xem các khu khác. Phiếu là tài liệu của một hoạt động trong ngày hội, không phải vé để đi qua cổng.',
        role: 'refutes', limitation: 'Phiếu chỉ nói về góc lắp mô hình, không liệt kê mọi hoạt động khác.',
        explanation: 'Tên khoản thu trên phiếu phản bác việc gọi đó là phí vào cửa.',
      },
    ],
    hints: [
      'Dòng 30.000 đồng nằm dưới tiêu đề nào của tờ rơi?',
      'Có chữ “tự chọn” hay “bắt buộc” trên bản đầy đủ không?',
      'Phí vật liệu và vé vào cửa có phải cùng một khoản không?',
    ],
    teacherNotes: 'Cho học sinh đặt ảnh cắt cạnh tờ rơi đầy đủ, khoanh “miễn phí vào cửa” và “bộ vật liệu tự chọn 30.000 đồng”. Câu nói phải trả tiền mới vào là gây hiểu lầm do chuyển phí một hoạt động thành phí của toàn sự kiện.',
    variantClaims: [
      'Ảnh trong nhóm cho thấy Ngày hội Khoa học 10/10 thu 30.000 đồng của mọi người muốn vào xem.',
      'Có bạn bảo phải mua vé 30.000 đồng mới được tham dự Ngày hội Khoa học ở trường.',
    ],
    feedback: {
      explanation: 'Ngày hội miễn phí vào cửa. Chỉ người tự chọn nhận bộ vật liệu ở góc lắp mô hình mới trả 30.000 đồng, nên ảnh cắt đã làm lệch ý nghĩa khoản phí.',
      questions: [
        'Tên khoản tiền và chữ “tự chọn” nằm ở đâu trên tờ rơi đầy đủ?',
        'Nếu tờ rơi mới ghi 30.000 đồng là vé bắt buộc vào cổng, bạn sẽ đổi lựa chọn thế nào?',
      ],
    },
  },
  {
    id: 'trong-cay-hoan',
    title: 'Buổi trồng cây đã bị hủy?',
    learningGoal: 'Giữ kết luận chưa chắc khi lời đồn, dự báo thời tiết và lịch cũ chưa cho biết quyết định mới.',
    claim: 'Một tin trong nhóm tình nguyện nói buổi trồng cây của Câu lạc bộ Môi trường vào Chủ nhật 11/10/2026 đã bị hủy vì dự báo mưa. Nhóm câu lạc bộ chưa đăng thông báo riêng về việc hủy.',
    truthStatus: 'insufficient',
    topic: 'Hoạt động tình nguyện',
    difficulty: 'Khó',
    sources: [
      {
        id: 'tin-chuyen', type: 'message', title: 'Lời nhắn “đã hủy” trong nhóm', author: 'Tài khoản Lá Nhỏ', publishedAt: '2026-10-08',
        content: 'Tài khoản Lá Nhỏ viết rằng buổi trồng cây Chủ nhật đã bị hủy vì có thể mưa. Người gửi nói nghe từ một bạn ở lớp khác, không nêu ai trong câu lạc bộ đã quyết định và không đính kèm thông báo. Một số người lặp lại nguyên văn nhưng không bổ sung bằng chứng.',
        role: 'insufficient', limitation: 'Lời kể không chỉ ra người có trách nhiệm ra quyết định.',
        explanation: 'Tin nhắn là tuyên bố cần kiểm tra, chưa phải bằng chứng buổi trồng cây bị hủy.',
      },
      {
        id: 'du-bao', type: 'article', title: 'Bản dự báo mưa cho Chủ nhật', author: 'Bảng thời tiết mô phỏng', publishedAt: '2026-10-08',
        content: 'Bản dự báo cho biết chiều 11/10 có khả năng mưa rào, còn buổi sáng chưa chắc có mưa. Đây là dự đoán thời tiết, không phải thông báo hoạt động của câu lạc bộ. Người tổ chức có thể đổi giờ, chuyển địa điểm, hoãn hoặc giữ kế hoạch tùy điều kiện thực tế.',
        role: 'context', limitation: 'Dự báo có thể thay đổi và không nói quyết định của ban tổ chức.',
        explanation: 'Khả năng mưa không tự chứng minh hoạt động đã bị hủy.',
      },
      {
        id: 'ke-hoach', type: 'schedule', title: 'Kế hoạch trồng cây công bố đầu tháng', author: 'Câu lạc bộ Môi trường Sao Mai', publishedAt: '2026-10-01',
        content: 'Kế hoạch đầu tháng ghi tập trung tại sân trường lúc 8:00 Chủ nhật 11/10 để đi trồng cây. Cuối trang có ghi câu lạc bộ sẽ thông báo nếu thời tiết buộc phải thay đổi. Bản này cho biết dự định ban đầu, nhưng không thể thay cho quyết định cập nhật sát ngày.',
        role: 'context', limitation: 'Kế hoạch cũ có thể được thay đổi bằng thông báo mới.',
        explanation: 'Kế hoạch ban đầu không xác nhận hoặc phủ nhận lời đồn hủy muộn hơn.',
      },
      {
        id: 'nhom-clb', type: 'social', title: 'Kênh câu lạc bộ lúc 18:00 ngày 08/10', author: 'Nhóm Câu lạc bộ Môi trường Sao Mai', publishedAt: '2026-10-08',
        content: 'Khi xem kênh chính của câu lạc bộ lúc 18:00, học sinh thấy bài kế hoạch đầu tháng vẫn được ghim, chưa có bài mới về hủy hoặc giữ buổi trồng cây. Một bình luận hỏi về thời tiết chưa được trả lời. Sự im lặng của kênh không phải xác nhận kế hoạch còn nguyên.',
        cites: ['ke-hoach'], role: 'insufficient', limitation: 'Chỉ phản ánh thời điểm 18:00, không cho biết thông báo sau đó.',
        explanation: 'Chưa có bài cập nhật không đủ để kết luận tin hủy đúng hay sai.',
      },
      {
        id: 'don-dang-ky', type: 'official', title: 'Phiếu đăng ký tình nguyện còn mở', author: 'Bàn đăng ký hoạt động học sinh', publishedAt: '2026-10-08',
        content: 'Bàn đăng ký vẫn nhận phiếu tham gia trồng cây trong ngày 08/10 và nhắc học sinh theo dõi kênh câu lạc bộ trước Chủ nhật. Người trực bàn không có quyết định mới từ ban tổ chức để công bố. Việc phiếu còn mở có thể do chưa cập nhật, nên không tự bác được tin hủy.',
        role: 'insufficient', limitation: 'Trạng thái phiếu không phải quyết định cuối về hoạt động.',
        explanation: 'Phiếu đang mở là dấu hiệu cần hỏi tiếp, không phải xác nhận hoạt động chắc chắn diễn ra.',
      },
      {
        id: 'bai-cu', type: 'image', title: 'Ảnh thông báo hoãn năm 2025', author: 'Câu lạc bộ Môi trường Sao Mai', publishedAt: '2025-10-08',
        content: 'Ảnh chụp thông báo hoãn một buổi trồng cây năm 2025 vì mưa lớn, có cùng biểu tượng câu lạc bộ và khung giấy quen thuộc. Khi được chuyển tiếp, phần năm bị khuất. Bản đầy đủ cho thấy ảnh thuộc mùa trước, nên không nói gì chắc chắn về ngày 11/10/2026.',
        role: 'context', limitation: 'Ảnh thuộc năm trước, không áp dụng cho hoạt động năm 2026.',
        explanation: 'Ảnh cũ có thể làm lời đồn hủy năm nay trông đáng tin hơn.',
      },
    ],
    hints: [
      'Ai có quyền thông báo hủy buổi trồng cây?',
      'Dự báo mưa là khả năng hay quyết định của câu lạc bộ?',
      'Kế hoạch đầu tháng và kênh im lặng có cho biết cập nhật sát ngày không?',
    ],
    teacherNotes: 'Hồ sơ dừng ở 18:00 ngày 08/10, trước khi ban tổ chức xác nhận hoặc phủ nhận việc hủy. Lời kể, dự báo mưa, kế hoạch đầu tháng và phiếu còn mở đều không quyết định được trạng thái cuối. Nhấn mạnh không suy từ sự im lặng của kênh chính thành tin đúng hoặc sai.',
    variantClaims: [
      'Nhóm tình nguyện lan tin Câu lạc bộ Môi trường đã bỏ buổi trồng cây ngày 11/10 vì sắp mưa.',
      'Một bạn bảo Chủ nhật 11/10 không còn hoạt động trồng cây, dù chưa đưa thông báo mới của câu lạc bộ.',
    ],
    feedback: {
      explanation: 'Hồ sơ chưa có quyết định mới từ Câu lạc bộ Môi trường. Dự báo mưa chỉ là khả năng, còn kế hoạch cũ và kênh chưa cập nhật đều không đủ để xác nhận hoặc bác tin hủy.',
      questions: [
        'Nhiều người nhắc lại cùng một lời kể có tạo thành xác nhận từ ban tổ chức không?',
        'Nếu câu lạc bộ đăng thông báo hoãn có ngày 11/10/2026, bạn sẽ đổi lựa chọn thế nào?',
      ],
    },
  },
]

export const additionalScenarios: Scenario[] = seeds.map(scenarioFromSeed)
