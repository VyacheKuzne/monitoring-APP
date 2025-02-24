export interface SSLInfo {
  host: string;                        // Хост
  port: number;                        // Порт
  protocol: string;                    // Протокол (например, HTTPS)
  endpoints: SSLEndpoint[];            // Массив точек входа SSL
  status: string;                      // Статус анализа (например, READY, IN_PROGRESS)
  startTime: number;                   // Время начала теста
  testTime: number;                    // Время завершения теста
  engineVersion: string;               // Версия движка анализа
  criteriaVersion: string;             // Версия критериев
  dnsNames: string[];                  // DNS имена
  signatureAlgorithm: string;          // Алгоритм подписи сертификата
  publicKey: PublicKey;                // Публичный ключ
  keyExchange: string;                 // Алгоритм обмена ключами
  cipherSuite: string;                 // Шифры, используемые в SSL-соединении
  certificate: Certificate;            // Данные сертификата
  certificateChain: Certificate[];     // Цепочка сертификатов
  validationStatus: string;            // Статус проверки сертификата
}

export interface SSLEndpoint {
  ipAddress: string;                   // IP-адрес сервера
  serverName: string;                  // Имя сервера
  statusMessage: string;               // Сообщение о статусе
  grade: string;                       // Оценка SSL-сертификата (например, A+, B)
  hasWarnings: boolean;                // Есть ли предупреждения
  isExceptional: boolean;              // Исключительный случай (например, если анализ не завершен)
  progress: number;                    // Прогресс теста в процентах
  duration: number;                    // Продолжительность теста
  delegation: number;                  // Степень делегации сертификата
  details: SSLDetails;                 // Подробности о точке входа SSL
}

export interface SSLDetails {
  signatureAlgorithm: string;          // Алгоритм подписи
  publicKey: PublicKey;                // Публичный ключ
  keyExchange: string;                 // Алгоритм обмена ключами
  cipherSuite: string;                 // Используемые шифры
  certificateInfo: Certificate;        // Данные сертификата
}

export interface Certificate {
  subject: string;                     // Субъект сертификата
  issuer: string;                      // Издатель сертификата
  notBefore: string;                   // Дата начала действия сертификата
  notAfter: string;                    // Дата окончания действия сертификата
  serialNumber: string;                // Серийный номер сертификата
  signatureAlgorithm: string;          // Алгоритм подписи сертификата
  publicKey: PublicKey;                // Публичный ключ
  validityPeriod: number;              // Период действия сертификата (в днях)
  version: number;                     // Версия сертификата
}

export interface PublicKey {
  algorithm: string;                   // Алгоритм публичного ключа (например, RSA)
  size: number;                        // Размер публичного ключа (например, 2048 бит)
  exponent: string;                    // Экспонента публичного ключа
}

export interface SSLInfoAPI {
  queue: number;                       // Количество тестов в очереди
  criteriaVersion: string;             // Версия критериев SSL Labs
  engines: Engine[];                   // Массив движков для анализа
  certTypes: string[];                 // Типы поддерживаемых сертификатов (например, EV, DV, OV)
  cipherSuites: string[];              // Поддерживаемые шифры
  protocols: string[];                 // Поддерживаемые протоколы
  preferredCiphers: string[];          // Рекомендуемые шифры
}

export interface Engine {
  name: string;                        // Название движка
  version: string;                     // Версия движка
  date: string;                        // Дата выпуска
}

