package com.fishbreeding.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vnpay_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VnpayTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vnpay_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "vnp_txn_ref", length = 50)
    private String vnpTxnRef;

    @Column(name = "vnp_transaction_no", length = 50)
    private String vnpTransactionNo;

    @Column(name = "vnp_response_code", length = 10)
    private String vnpResponseCode;

    @Column(name = "vnp_amount", precision = 15, scale = 2)
    private BigDecimal vnpAmount;

    @Column(name = "vnp_bank_code", length = 20)
    private String vnpBankCode;

    @Column(name = "vnp_pay_date")
    private LocalDateTime vnpPayDate;

    // We can map JSONB to String easily. For full jsonb support one can use hypersistence-utils, but String is native enough for raw logs.
    @Column(name = "vnp_raw_response", columnDefinition = "jsonb")
    private String vnpRawResponse;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}