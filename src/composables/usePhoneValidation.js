export function usePhoneValidation() {
  const phoneRules = [
    v => !v || /^010-\d{4}-\d{4}$/.test(v) || '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)',
  ]

  const requiredPhoneRules = [
    v => !!v || '전화번호를 입력해주세요.',
    v => /^010-\d{4}-\d{4}$/.test(v) || '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)',
  ]

  function formatPhoneInput(value) {
    const numbers = value.replace(/[^\d]/g, '').slice(0, 11)
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
  }

  return { phoneRules, requiredPhoneRules, formatPhoneInput }
}
