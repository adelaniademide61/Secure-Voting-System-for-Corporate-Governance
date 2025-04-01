;; proposal-submission.clar
;; Manages resolutions for consideration

(define-data-var proposal-count uint u0)

(define-map proposals
  { id: uint }
  { title: (string-utf8 256),
    description: (string-utf8 1024),
    proposer: principal,
    start-block: uint,
    end-block: uint,
    status: (string-ascii 16) })

(define-public (submit-proposal
                (title (string-utf8 256))
                (description (string-utf8 1024))
                (start-block uint)
                (end-block uint))
  (let ((proposal-id (var-get proposal-count)))
    (asserts! (> end-block start-block) (err u101))
    (asserts! (>= start-block block-height) (err u102))
    (map-set proposals
      { id: proposal-id }
      { title: title,
        description: description,
        proposer: tx-sender,
        start-block: start-block,
        end-block: end-block,
        status: "active" })
    (var-set proposal-count (+ proposal-id u1))
    (ok proposal-id)))

(define-read-only (get-proposal (id uint))
  (map-get? proposals { id: id }))

