import Link from "next/link";

export const metadata = {
  title: "이용약관 및 개인정보처리방침 - SCH 맛집 지도",
  description: "SCH 맛집 지도 서비스 이용약관, 개인정보처리방침, IP 수집 고지사항",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">이용약관 및 고지사항</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        {/* 목차 */}
        <nav className="p-4 bg-white rounded-xl border border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 mb-3">목차</h2>
          <ol className="space-y-1.5 text-sm text-indigo-600">
            <li><a href="#terms" className="hover:underline">1. 서비스 이용약관</a></li>
            <li><a href="#privacy" className="hover:underline">2. 개인정보 처리방침</a></li>
            <li><a href="#ip" className="hover:underline">3. IP 주소 수집 고지</a></li>
            <li><a href="#review-data" className="hover:underline">4. 리뷰 데이터 수집 및 이용</a></li>
            <li><a href="#photos" className="hover:underline">5. 사진 업로드 관련 안내</a></li>
            <li><a href="#cookies" className="hover:underline">6. 쿠키 및 로컬 저장소</a></li>
            <li><a href="#third-party" className="hover:underline">7. 제3자 서비스 이용</a></li>
            <li><a href="#disclaimer" className="hover:underline">8. 면책 조항</a></li>
            <li><a href="#contact" className="hover:underline">9. 문의처</a></li>
          </ol>
        </nav>

        {/* 1. 서비스 이용약관 */}
        <section id="terms">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
            서비스 이용약관
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">제1조 (목적)</h3>
              <p>
                본 약관은 &quot;SCH 맛집 지도&quot; 서비스(이하 &quot;서비스&quot;)의 이용에 관한 조건 및 절차를 규정함을 목적으로 합니다.
                본 서비스는 <strong>순천향대학교 컴퓨터소프트웨어공학과 학생들만의 한정적인 내부 정보 공유 및 편의</strong>를 위해 제공되는 비상업적·폐쇄적 커뮤니티 프로젝트이며, 불특정 다수를 향한 공개 웹서비스가 아님을 명시합니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">제2조 (서비스 내용)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>순천향대학교 인근 음식점 정보 제공 (위치, 카테고리 등)</li>
                <li>음식점에 대한 별점 평가 및 텍스트 리뷰 작성</li>
                <li>리뷰에 사진 첨부 기능</li>
                <li>랜덤 음식점 추천 기능</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">제3조 (이용자의 의무)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>타인의 명예를 훼손하거나 비방하는 내용을 작성하지 않습니다.</li>
                <li>허위 사실을 유포하거나 상업적 목적의 광고를 게시하지 않습니다.</li>
                <li>음란, 폭력적이거나 법률에 위반되는 내용을 게시하지 않습니다.</li>
                <li>타인의 개인정보를 무단으로 수집하거나 게시하지 않습니다.</li>
                <li>타인의 저작권을 침해하는 사진이나 콘텐츠를 업로드하지 않습니다.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">제4조 (서비스 운영)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>운영자는 약관을 위반한 리뷰 및 콘텐츠를 사전 통보 없이 삭제할 수 있습니다.</li>
                <li>서비스는 사전 공지 후 변경, 중단될 수 있습니다.</li>
                <li>서비스의 안정적 운영을 위해 시스템 점검이 진행될 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. 개인정보 처리방침 */}
        <section id="privacy">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
            개인정보 처리방침
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">수집하는 개인정보 항목</h3>
              <p>본 서비스는 회원가입 절차가 없으며, 최소한의 정보만 수집합니다.</p>
              <table className="w-full mt-2 border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border-b">항목</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border-b">내용</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border-b">수집 목적</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2 font-medium">닉네임</td>
                    <td className="px-3 py-2">리뷰 작성 시 입력</td>
                    <td className="px-3 py-2">리뷰 작성자 식별</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2 font-medium">리뷰 내용</td>
                    <td className="px-3 py-2">텍스트, 별점, 사진</td>
                    <td className="px-3 py-2">음식점 리뷰 서비스 제공</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2 font-medium">IP 주소</td>
                    <td className="px-3 py-2">서비스 접속 시 자동 수집</td>
                    <td className="px-3 py-2">서비스 보안 및 악용 방지</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">접속 로그</td>
                    <td className="px-3 py-2">접속 일시, 브라우저 정보</td>
                    <td className="px-3 py-2">서비스 운영 및 개선</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">개인정보 보유 및 이용 기간</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>리뷰 데이터: 리뷰 삭제 시까지 보유</li>
                <li>접속 로그 및 IP: 수집일로부터 <strong>3개월</strong> 후 파기</li>
                <li>업로드 사진: 리뷰 삭제 시 함께 파기</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">개인정보의 파기</h3>
              <p>보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 파기합니다. 전자적 파일 형태의 개인정보는 복구할 수 없는 방법으로 삭제합니다.</p>
            </div>
          </div>
        </section>

        {/* 3. IP 수집 고지 */}
        <section id="ip">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
            IP 주소 수집 고지
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 text-sm text-gray-700 leading-relaxed">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="font-semibold text-amber-800 mb-1">IP 주소 수집 안내</p>
              <p className="text-amber-700 text-xs">
                본 서비스는 서비스 이용 과정에서 이용자의 IP 주소가 자동으로 수집됩니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">수집 목적</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>서비스 보안:</strong> 비정상적 접근 탐지 및 차단</li>
                <li><strong>악용 방지:</strong> 스팸 리뷰, 도배, 악성 행위 방지</li>
                <li><strong>법적 의무:</strong> 정보통신망법 등 관련 법률에 따른 접속 기록 보관</li>
                <li><strong>서비스 개선:</strong> 접속 통계 분석을 통한 서비스 품질 향상</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">수집 방식</h3>
              <p>서비스 서버(Firebase) 접속 시 자동으로 수집되며, 이용자가 별도로 입력하지 않아도 서버 로그에 기록됩니다.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">보유 기간</h3>
              <p>수집된 IP 주소는 <strong>3개월간 보관</strong> 후 자동 파기됩니다. 단, 법령에 의해 보관이 필요한 경우 해당 기간 동안 보관합니다.</p>
            </div>
          </div>
        </section>

        {/* 4. 리뷰 데이터 수집 및 이용 */}
        <section id="review-data">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
            리뷰 데이터 수집 및 이용
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">수집 항목</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>닉네임 (자유 입력, 실명 불필요)</li>
                <li>별점 (1~5점)</li>
                <li>리뷰 텍스트</li>
                <li>첨부 사진 (선택사항, 최대 3장)</li>
                <li>작성 일시</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">이용 범위</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>해당 음식점 상세 페이지에 리뷰로 표시</li>
                <li>음식점 평균 평점 계산에 활용</li>
                <li>서비스 내 음식점 추천 및 정렬에 활용</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">이용 제한</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>수집된 리뷰 데이터는 <strong>본 서비스 내에서만</strong> 사용됩니다.</li>
                <li>리뷰 데이터를 제3자에게 판매, 제공하지 않습니다.</li>
                <li>마케팅, 광고 등 상업적 목적으로 활용하지 않습니다.</li>
                <li>통계적 분석 시에는 개인을 식별할 수 없는 형태로만 사용합니다.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">리뷰 삭제</h3>
              <p>
                운영자(관리자)에 의해 약관을 위반한 리뷰는 삭제될 수 있습니다.
                본인이 작성한 리뷰의 삭제를 원하시는 경우 하단 문의처로 연락해 주세요.
              </p>
            </div>
          </div>
        </section>

        {/* 5. 사진 업로드 관련 안내 */}
        <section id="photos">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
            사진 업로드 관련 안내
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">업로드 규정</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>리뷰 1건당 최대 <strong>3장</strong>의 사진을 첨부할 수 있습니다.</li>
                <li>사진은 서버에서 자동으로 압축 처리됩니다 (최대 1MB).</li>
                <li>업로드된 사진은 서비스 자체적으로 운영하는 이미지 전용 서버에 안전하게 저장됩니다.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">금지 사항</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>타인의 얼굴이 식별 가능한 사진 (당사자 동의 없이)</li>
                <li>저작권이 있는 타인의 사진이나 이미지</li>
                <li>음란하거나 불쾌감을 주는 이미지</li>
                <li>음식점과 무관한 사진이나 광고성 이미지</li>
                <li>개인정보(전화번호, 주소 등)가 포함된 사진</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">사진 저작권</h3>
              <p>
                업로드한 사진의 저작권은 원 저작자에게 있으며, 이용자는 본 서비스에서 해당 사진이 리뷰와 함께 표시되는 것에 동의합니다.
                운영자는 서비스 운영 목적으로만 해당 사진을 사용하며, 외부 유출 또는 상업적 이용을 하지 않습니다.
              </p>
            </div>
          </div>
        </section>

        {/* 6. 쿠키 및 로컬 저장소 */}
        <section id="cookies">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
            쿠키 및 로컬 저장소
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>본 서비스는 다음과 같은 목적으로 쿠키 또는 브라우저 로컬 저장소를 사용할 수 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>관리자 로그인 상태 유지 (세션 내)</li>
              <li>Firebase SDK의 정상적인 동작을 위한 기술적 쿠키</li>
              <li>Kakao Maps API의 지도 서비스 제공을 위한 기술적 쿠키</li>
            </ul>
            <p>이러한 쿠키는 서비스 제공에 필수적인 기술 쿠키로, 광고 추적이나 프로파일링 목적으로 사용되지 않습니다.</p>
          </div>
        </section>

        {/* 7. 제3자 서비스 이용 */}
        <section id="third-party">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">7</span>
            제3자 서비스 이용
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>본 서비스는 아래의 제3자 서비스를 활용하며, 각 서비스의 개인정보 처리방침이 적용됩니다.</p>
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border-b">서비스</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border-b">제공자</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border-b">용도</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Firebase Firestore</td>
                  <td className="px-3 py-2">Google LLC</td>
                  <td className="px-3 py-2">데이터베이스 (음식점, 리뷰 저장)</td>
                </tr>

                <tr>
                  <td className="px-3 py-2 font-medium">Kakao Maps API</td>
                  <td className="px-3 py-2">Kakao Corp.</td>
                  <td className="px-3 py-2">지도 서비스 제공</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-500">
              각 서비스 제공자의 서버는 한국 또는 해외에 위치할 수 있으며, 해당 서비스의 이용약관 및 개인정보 처리방침에 따라 운영됩니다.
            </p>
          </div>
        </section>

        {/* 8. 면책 조항 */}
        <section id="disclaimer">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">8</span>
            면책 조항
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 text-sm text-gray-700 leading-relaxed">
            <ul className="list-disc pl-5 space-y-1">
              <li>본 서비스에 게시된 음식점 정보 및 리뷰는 이용자가 직접 작성한 것으로, 운영자가 그 정확성이나 신뢰성을 보장하지 않습니다.</li>
              <li>리뷰에 포함된 의견은 작성자 개인의 주관적 견해이며, 운영자의 입장과 무관합니다.</li>
              <li>음식점 방문 및 이용에 따른 결과에 대해 운영자는 책임을 지지 않습니다.</li>
              <li>서비스 장애, 데이터 손실 등 기술적 문제로 인한 피해에 대해 운영자는 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.</li>
              <li>이용자 간 또는 이용자와 음식점 간의 분쟁에 대해 운영자는 개입하거나 책임을 지지 않습니다.</li>
            </ul>
          </div>
        </section>

        {/* 9. 문의처 */}
        <section id="contact">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">9</span>
            문의처
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>서비스 이용 중 문의사항이 있으시면 아래로 연락해 주세요.</p>
            <div className="p-4 bg-indigo-50 rounded-xl space-y-2">
              <p><strong>서비스명:</strong> SCH 맛집 지도</p>
              <p><strong>운영:</strong> 순천향대학교 컴퓨터소프트웨어공학과 내부 프로젝트</p>
              <p><strong>문의:</strong> 서비스 내 관리자에게 문의</p>
            </div>
          </div>
        </section>

        {/* 시행일 */}
        <div className="text-center text-xs text-gray-400 pb-8">
          <p>본 약관은 2026년 4월 6일부터 시행됩니다.</p>
          <p className="mt-1">최종 수정: 2026년 4월 6일</p>
        </div>
      </main>
    </div>
  );
}
