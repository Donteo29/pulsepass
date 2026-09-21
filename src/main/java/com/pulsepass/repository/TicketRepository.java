package com.pulsepass.repository;

import com.pulsepass.entity.Ticket;
import com.pulsepass.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUser_Email(String email);

    List<Ticket> findByUser_EmailAndStatus(String email, TicketStatus status);

    List<Ticket> findByStatusAndEvent_EventCode(TicketStatus status, String eventCode);

    @Query("""
            select count(t)
            from Ticket t
            where t.status = com.pulsepass.entity.TicketStatus.PAID
              and t.event.eventCode = :eventCode
            """)
    long countPaidTicketsByEventCode(@Param("eventCode") String eventCode);

    @Query("""
            select t
            from Ticket t
            join t.event e
            where e.eventDate > :after
            order by e.eventDate asc
            """)
    List<Ticket> findTicketsForEventsAfter(@Param("after") LocalDateTime after);
}
