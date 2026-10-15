package com.pulsepass.repository;

import com.pulsepass.entity.Artist;
import com.pulsepass.entity.Event;
import com.pulsepass.entity.EventCategory;
import com.pulsepass.entity.EventStatus;
import com.pulsepass.entity.Ticket;
import com.pulsepass.entity.TicketStatus;
import com.pulsepass.entity.TicketType;
import com.pulsepass.entity.User;
import com.pulsepass.entity.UserProfile;
import com.pulsepass.entity.Venue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Testcontainers
@Transactional
class PulsePassRepositoryTest {

    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Test
    void flywaySeedsArtistsAndHibernateValidatesSchema() {
        assertThat(artistRepository.findByStageName("Solar Beat")).isPresent();
        assertThat(artistRepository.findByStageName("Neon Waves")).isPresent();
        assertThat(artistRepository.findByStageName("Caribbean Sound")).isPresent();
        assertThat(artistRepository.findByStageName("Ocean Drive")).isPresent();
        assertThat(artistRepository.findByStageName("Digital Pulse")).isPresent();
    }

    @Test
    void persistsVenueEventArtistsUserProfileAndTickets() {
        Scenario scenario = createScenario();

        assertThat(venueRepository.findByCode("VEN-SMR-01"))
                .get()
                .extracting(Venue::getCapacity)
                .isEqualTo(5000);

        assertThat(eventRepository.findByEventCode("CMF-2026"))
                .get()
                .satisfies(event -> {
                    assertThat(event.getVenue().getCode()).isEqualTo("VEN-SMR-01");
                    assertThat(event.getStreamingUrl()).isEqualTo("https://stream.pulsepass.test/cmf-2026");
                });

        assertThat(eventRepository.findByVenue_Code("VEN-SMR-01"))
                .extracting(Event::getEventCode)
                .containsExactlyInAnyOrder("CMF-2026", "TECH-2026", "DRAFT-2026");

        assertThat(userRepository.findByEmailIgnoreCase("ANDREA@EXAMPLE.COM"))
                .get()
                .extracting(User::getUsername)
                .isEqualTo("andrea");

        assertThat(userProfileRepository.findByUser_Email("andrea@example.com"))
                .get()
                .extracting(UserProfile::getCity)
                .isEqualTo("Santa Marta");

        assertThat(ticketRepository.findByUser_EmailAndStatus("andrea@example.com", TicketStatus.PAID))
                .extracting(Ticket::getTicketCode)
                .containsExactly("TCK-0001");

        assertThat(ticketRepository.findByStatusAndEvent_EventCode(TicketStatus.PAID, "CMF-2026"))
                .extracting(Ticket::getTicketCode)
                .containsExactlyInAnyOrder("TCK-0001", "TCK-0002");

        assertThat(ticketRepository.countPaidTicketsByEventCode("CMF-2026")).isEqualTo(2);

        assertThat(scenario.mainEvent().getArtists())
                .extracting(Artist::getStageName)
                .containsExactlyInAnyOrder("Solar Beat", "Neon Waves", "Caribbean Sound");
    }

    @Test
    void repositoryQueriesReturnExpectedEvents() {
        createScenario();

        assertThat(eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED))
                .extracting(Event::getEventCode)
                .containsExactly("CMF-2026", "TECH-2026");

        assertThat(eventRepository.findDistinctByArtistStageName("Solar Beat"))
                .extracting(Event::getEventCode)
                .containsExactly("CMF-2026", "TECH-2026", "DRAFT-2026");

        assertThat(eventRepository.findByCityAndArtistStageName("Santa Marta", "Solar Beat"))
                .extracting(Event::getEventCode)
                .containsExactly("CMF-2026", "TECH-2026", "DRAFT-2026");

        assertThat(eventRepository.findRecommendedEvents("santa marta", LocalDateTime.of(2025, 1, 1, 0, 0), "solar"))
                .extracting(Event::getEventCode)
                .containsExactly("CMF-2026", "TECH-2026");

        assertThat(ticketRepository.findTicketsForEventsAfter(LocalDateTime.of(2026, 1, 1, 0, 0)))
                .extracting(Ticket::getTicketCode)
                .containsExactly("TCK-0001", "TCK-0002", "TCK-0003", "TCK-0004");
    }

    @Test
    void databaseRejectsCriticalConstraintViolations() {
        Venue venue = venueRepository.saveAndFlush(new Venue(
                "VEN-SMR-01",
                "Marina Convention Center",
                "Santa Marta",
                "Av. Marina 100",
                5000,
                true
        ));

        assertThatThrownBy(() -> venueRepository.saveAndFlush(new Venue(
                venue.getCode(),
                "Duplicate Venue",
                "Santa Marta",
                "Other address",
                1000,
                true
        ))).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void databaseRejectsSecondProfileForSameUser() {
        Scenario scenario = createScenario();

        assertThatThrownBy(() -> userProfileRepository.saveAndFlush(new UserProfile(
                "Andrea",
                "Second Profile",
                "3000000001",
                "Santa Marta",
                LocalDate.of(1994, 2, 3),
                scenario.andrea()
        ))).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void databaseRejectsDuplicateTicketCode() {
        Scenario scenario = createScenario();

        assertThatThrownBy(() -> ticketRepository.saveAndFlush(new Ticket(
                "TCK-0001",
                TicketType.GENERAL,
                new BigDecimal("120000.00"),
                TicketStatus.RESERVED,
                LocalDateTime.of(2026, 1, 4, 10, 0),
                scenario.carlos(),
                scenario.mainEvent()
        ))).isInstanceOf(DataIntegrityViolationException.class);
    }

    private Scenario createScenario() {
        Venue venue = venueRepository.save(new Venue(
                "VEN-SMR-01",
                "Marina Convention Center",
                "Santa Marta",
                "Av. Marina 100",
                5000,
                true
        ));

        Artist solarBeat = artistRepository.findByStageName("Solar Beat").orElseThrow();
        Artist neonWaves = artistRepository.findByStageName("Neon Waves").orElseThrow();
        Artist caribbeanSound = artistRepository.findByStageName("Caribbean Sound").orElseThrow();
        Artist digitalPulse = artistRepository.findByStageName("Digital Pulse").orElseThrow();

        Event mainEvent = new Event(
                "CMF-2026",
                "Caribbean Music Fest 2026",
                "Festival musical principal de PulsePass.",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.of(2026, 7, 18, 20, 0),
                18,
                venue
        );
        mainEvent.setStreamingUrl("https://stream.pulsepass.test/cmf-2026");
        mainEvent.addArtist(solarBeat);
        mainEvent.addArtist(neonWaves);
        mainEvent.addArtist(caribbeanSound);

        Event techEvent = new Event(
                "TECH-2026",
                "Digital Pulse Summit",
                "Conferencia de tecnologia y musica digital.",
                EventCategory.TECHNOLOGY,
                EventStatus.PUBLISHED,
                LocalDateTime.of(2026, 8, 9, 9, 0),
                16,
                venue
        );
        techEvent.addArtist(solarBeat);
        techEvent.addArtist(digitalPulse);

        Event draftEvent = new Event(
                "DRAFT-2026",
                "Evento en borrador",
                "Evento no publicado para validar filtros.",
                EventCategory.CULTURE,
                EventStatus.DRAFT,
                LocalDateTime.of(2026, 9, 1, 18, 0),
                0,
                venue
        );
        draftEvent.addArtist(solarBeat);

        eventRepository.saveAll(List.of(mainEvent, techEvent, draftEvent));

        User andrea = userRepository.save(new User("andrea", "andrea@example.com", true));
        User carlos = userRepository.save(new User("carlos", "carlos@example.com", true));
        User laura = userRepository.save(new User("laura", "laura@example.com", true));
        User miguel = userRepository.save(new User("miguel", "miguel@example.com", true));

        userProfileRepository.save(new UserProfile(
                "Andrea",
                "Perez",
                "3001234567",
                "Santa Marta",
                LocalDate.of(1994, 2, 3),
                andrea
        ));

        ticketRepository.saveAll(List.of(
                new Ticket("TCK-0001", TicketType.VIP, new BigDecimal("250000.00"), TicketStatus.PAID,
                        LocalDateTime.of(2026, 1, 1, 10, 0), andrea, mainEvent),
                new Ticket("TCK-0002", TicketType.GENERAL, new BigDecimal("120000.00"), TicketStatus.PAID,
                        LocalDateTime.of(2026, 1, 2, 10, 0), carlos, mainEvent),
                new Ticket("TCK-0003", TicketType.GENERAL, new BigDecimal("120000.00"), TicketStatus.RESERVED,
                        LocalDateTime.of(2026, 1, 3, 10, 0), laura, mainEvent),
                new Ticket("TCK-0004", TicketType.VIP, new BigDecimal("250000.00"), TicketStatus.CANCELLED,
                        LocalDateTime.of(2026, 1, 4, 10, 0), miguel, mainEvent)
        ));

        ticketRepository.flush();
        return new Scenario(mainEvent, andrea, carlos);
    }

    private record Scenario(Event mainEvent, User andrea, User carlos) {
    }
}
