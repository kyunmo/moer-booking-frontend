export function useFormRules() {
  const required = v => !!v || '필수 입력 항목입니다.'
  const requiredWithLabel = label => v => !!v || `${label}을(를) 입력해주세요.`
  const email = v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || '올바른 이메일 형식이 아닙니다.'
  const minLength = (min) => v => !v || v.length >= min || `최소 ${min}자 이상 입력해주세요.`
  const maxLength = (max) => v => !v || v.length <= max || `최대 ${max}자까지 입력 가능합니다.`

  return { required, requiredWithLabel, email, minLength, maxLength }
}
