/**
 * 환경 변수를 읽고, 없을 경우 에러를 출력하고 프로세스를 종료합니다.
 * @param key 환경 변수 키
 * @returns 환경 변수 값
 */
function getEnvVariable(key) {
  const value = process.env[key];
  if (!value) {
    console.error(`환경 변수 ${key}가 설정되지 않았습니다.`);
    process.exit(1);
  }
  return value;
}

module.exports = {
  getEnvVariable,
}