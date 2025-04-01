;; shareholder-verification.clar
;; Validates voting eligibility and shares

(define-constant contract-owner tx-sender)

(define-data-var minimum-shares uint u100)

(define-map shareholders
  { address: principal }
  { shares: uint, verified: bool })

(define-public (register-shareholder (address principal) (shares uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u100))
    (ok (map-set shareholders
      { address: address }
      { shares: shares, verified: true }))))

(define-read-only (get-shareholder-shares (address principal))
  (default-to u0 (get shares (map-get? shareholders { address: address }))))

(define-read-only (can-vote (address principal) (required-shares uint))
  (let ((shareholder-shares (get-shareholder-shares address)))
    (and
      (default-to false (get verified (map-get? shareholders { address: address })))
      (>= shareholder-shares required-shares))))

