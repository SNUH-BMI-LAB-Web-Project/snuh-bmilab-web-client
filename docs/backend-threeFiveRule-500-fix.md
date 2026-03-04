# Backend: ThreeFiveRuleType 500 에러 수정

## 현상
- `GET /tasks` (과제 목록 조회) 시 500 발생
- `InvalidDataAccessApiUsageException: No enum constant com.bmilab.backend.domain.task.enums.ThreeFiveRuleType`

## 원인
DB에 저장된 `three_five_rule` 값이 enum에 없음 (null, 빈 문자열, 또는 예전 값).

과제 Entity → DTO 매핑 시 `ThreeFiveRuleType.valueOf(dbValue)` 호출 시 알 수 없는 값이면 예외 발생.

## 백엔드 수정 제안
Task → TaskSummaryResponse (또는 과제 목록 DTO) 매핑 시:

1. **null/빈 값 허용**: `threeFiveRule`이 null이거나 빈 문자열이면 DTO에는 `null` 또는 `NOT_APPLICABLE`로 설정
2. **알 수 없는 값 처리**: `valueOf` 대신 try-catch 또는 허용 값 Set으로 검사 후, 잘못된 값이면 `null` 또는 `NOT_APPLICABLE`로 설정

예시 (Java):
```java
// 매핑 로직에서
String raw = entity.getThreeFiveRule();
if (raw == null || raw.isBlank()) {
    dto.setThreeFiveRule(null); // 또는 ThreeFiveRuleType.NOT_APPLICABLE
} else {
    try {
        dto.setThreeFiveRule(ThreeFiveRuleType.valueOf(raw));
    } catch (IllegalArgumentException e) {
        dto.setThreeFiveRule(ThreeFiveRuleType.NOT_APPLICABLE);
    }
}
```

DB에 이미 들어간 잘못된 값은 마이그레이션으로 `NOT_APPLICABLE` 등으로 정리하는 것을 권장합니다.

## 프론트엔드 대응 (완료)
- 전송 시 `normalizeThreeFiveRuleForApi()`로 항상 `RESPONSIBLE` | `JOINT` | `NOT_APPLICABLE`만 전송
- 수신 시 동일 함수로 정규화해 표시
