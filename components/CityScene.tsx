export function CityScene({ compact = false }: { compact?: boolean }) {
  return (
    <svg className={compact ? 'city-scene compact' : 'city-scene'} viewBox="0 0 484 438" fill="none" role="img" aria-label="Illustration of a warm neighborhood corner shop and nearby buildings">
      <path d="M0 392h484v46H0z" fill="#d6bfa0" />
      <path d="M24 84h151v308H24z" fill="#768770" stroke="#29372b" strokeWidth="3" />
      <path d="M39 104h38v55H39zm55 0h38v55H94zM39 185h38v55H39zm55 0h38v55H94z" fill="#f3dfaf" stroke="#29372b" strokeWidth="3" />
      <path d="M119 85V55l30-23 26 23v30" fill="#768770" stroke="#29372b" strokeWidth="3" />
      <circle cx="148" cy="68" r="7" fill="#e8ba76" />
      <path d="M171 177h264v215H171z" fill="#f4d7ac" stroke="#29372b" strokeWidth="3" />
      <path d="M183 168h244l17 23H170l13-23Z" fill="#ba5e47" stroke="#29372b" strokeWidth="3" />
      <path d="M178 191h257v40H178z" fill="#e1a58a" stroke="#29372b" strokeWidth="3" />
      <path d="M178 231h257l-12 39h-34l-15-39-13 39h-33l-15-39-14 39h-33l-15-39-12 39h-34l-11-39Z" fill="#fff3d8" stroke="#29372b" strokeWidth="3" strokeLinejoin="round" />
      <path d="M194 280h84v112h-84zm120 0h101v112H314z" fill="#647c71" stroke="#29372b" strokeWidth="3" />
      <path d="M235 280v112m79-60h101" stroke="#f4d7ac" strokeWidth="4" />
      <path d="M198 359h32m129-53h13" stroke="#f4d7ac" strokeWidth="4" strokeLinecap="round" />
      <path d="M292 209h8m8 0h8" stroke="#29372b" strokeWidth="4" strokeLinecap="round" />
      <path d="M81 360c-34-19-28-54-10-56 16-22 42-12 47 9 27 9 17 40-8 48" fill="#59795b" stroke="#29372b" strokeWidth="3" />
      <path d="M89 356v36m31 0h12m317 0h13" stroke="#29372b" strokeWidth="4" />
      <path d="M241 316c15-25 35-14 36 2m-13 29-7-13" stroke="#f4d7ac" strokeWidth="3" strokeLinecap="round" />
      <rect x="224" y="182" width="164" height="42" rx="2" fill="#edb976" stroke="#29372b" strokeWidth="3" />
      <text x="306" y="208" fill="#29372b" textAnchor="middle" fontSize="14" fontWeight="800" letterSpacing="2" fontFamily="Arial, sans-serif">CORNER TABLE</text>
    </svg>
  );
}
