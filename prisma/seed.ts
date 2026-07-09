import 'dotenv/config'
import { PrismaClient, EventStatus, SeatStatus } from '../src/generated/prisma'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const prisma = process.env.TURSO_DATABASE_URL
    ? new PrismaClient({
          adapter: new PrismaLibSQL({
              url: process.env.TURSO_DATABASE_URL,
              authToken: process.env.TURSO_AUTH_TOKEN,
          }),
      })
    : new PrismaClient()

const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000)

type TeamSeed = { name: string; shortName: string }

const createTeams = async (sportId: string, teams: TeamSeed[]) => {
    const created = await Promise.all(
        teams.map((t) => prisma.team.create({ data: { ...t, sportId } }))
    )
    const byShortName = new Map(created.map((t) => [t.shortName, t]))
    return byShortName
}

type SectionSeed = { name: string; rows: number; seatsPerRow: number }

const createVenue = (name: string, city: string, capacity: number, sections: SectionSeed[]) =>
    prisma.venue.create({
        data: { name, city, capacity, sections: { create: sections } },
        include: { sections: true },
    })

async function main() {
    await prisma.bookingSeat.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.waitlistEntry.deleteMany()
    await prisma.favorite.deleteMany()
    await prisma.seat.deleteMany()
    await prisma.eventSection.deleteMany()
    await prisma.event.deleteMany()
    await prisma.section.deleteMany()
    await prisma.venue.deleteMany()
    await prisma.team.deleteMany()
    await prisma.sport.deleteMany()
    await prisma.user.deleteMany()

    const [football, cricket, basketball] = await Promise.all([
        prisma.sport.create({ data: { name: 'Football', slug: 'football' } }),
        prisma.sport.create({ data: { name: 'Cricket', slug: 'cricket' } }),
        prisma.sport.create({ data: { name: 'Basketball', slug: 'basketball' } }),
    ])

    const fb = await createTeams(football.id, [
        { name: 'Arsenal', shortName: 'ARS' },
        { name: 'Manchester City', shortName: 'MCI' },
        { name: 'Liverpool', shortName: 'LIV' },
        { name: 'Chelsea', shortName: 'CHE' },
        { name: 'Manchester United', shortName: 'MUN' },
        { name: 'Tottenham Hotspur', shortName: 'TOT' },
        { name: 'Real Madrid', shortName: 'RMA' },
        { name: 'FC Barcelona', shortName: 'BAR' },
        { name: 'Atletico Madrid', shortName: 'ATM' },
    ])

    const cr = await createTeams(cricket.id, [
        { name: 'Mumbai Indians', shortName: 'MI' },
        { name: 'Chennai Super Kings', shortName: 'CSK' },
        { name: 'Royal Challengers Bengaluru', shortName: 'RCB' },
        { name: 'Kolkata Knight Riders', shortName: 'KKR' },
        { name: 'India', shortName: 'IND' },
        { name: 'Australia', shortName: 'AUS' },
        { name: 'England', shortName: 'ENG' },
        { name: 'South Africa', shortName: 'RSA' },
    ])

    const bb = await createTeams(basketball.id, [
        { name: 'Los Angeles Lakers', shortName: 'LAL' },
        { name: 'Boston Celtics', shortName: 'BOS' },
        { name: 'Golden State Warriors', shortName: 'GSW' },
        { name: 'Chicago Bulls', shortName: 'CHI' },
        { name: 'Miami Heat', shortName: 'MIA' },
        { name: 'Phoenix Suns', shortName: 'PHX' },
    ])

    const emirates = await createVenue('Emirates Stadium', 'London', 60704, [
        { name: 'Lower Tier', rows: 4, seatsPerRow: 8 },
        { name: 'Club Level', rows: 2, seatsPerRow: 6 },
    ])
    const bernabeu = await createVenue('Santiago Bernabeu', 'Madrid', 81044, [
        { name: 'Main Stand', rows: 4, seatsPerRow: 8 },
        { name: 'Fondo Norte', rows: 2, seatsPerRow: 6 },
    ])
    const wankhede = await createVenue('Wankhede Stadium', 'Mumbai', 33108, [
        { name: 'North Stand', rows: 4, seatsPerRow: 8 },
        { name: 'Sachin Tendulkar Stand', rows: 2, seatsPerRow: 6 },
    ])
    const edenGardens = await createVenue('Eden Gardens', 'Kolkata', 66000, [
        { name: 'Club House', rows: 4, seatsPerRow: 8 },
        { name: 'Ring Stand', rows: 2, seatsPerRow: 6 },
    ])
    const cryptoArena = await createVenue('Crypto.com Arena', 'Los Angeles', 19068, [
        { name: 'Upper Bowl', rows: 4, seatsPerRow: 8 },
        { name: 'Courtside', rows: 1, seatsPerRow: 6 },
    ])
    const tdGarden = await createVenue('TD Garden', 'Boston', 19156, [
        { name: 'Balcony', rows: 4, seatsPerRow: 8 },
        { name: 'Floor Seats', rows: 1, seatsPerRow: 6 },
    ])

    type EventSeed = {
        sportId: string
        league: string
        home: string
        away: string
        venue: typeof emirates
        startTime: Date
        status: EventStatus
        soldOut?: boolean
    }
    const team = (map: Map<string, { id: string }>, shortName: string) =>
        map.get(shortName)!.id

    const eventSeeds: EventSeed[] = [
        // Premier League
        { sportId: football.id, league: 'Premier League', home: 'ARS', away: 'MCI', venue: emirates, startTime: hoursFromNow(72), status: 'UPCOMING' },
        { sportId: football.id, league: 'Premier League', home: 'LIV', away: 'CHE', venue: emirates, startTime: hoursFromNow(0.5), status: 'LIVE' },
        { sportId: football.id, league: 'Premier League', home: 'ARS', away: 'CHE', venue: emirates, startTime: hoursFromNow(-48), status: 'FINISHED' },
        { sportId: football.id, league: 'Premier League', home: 'MUN', away: 'TOT', venue: emirates, startTime: hoursFromNow(144), status: 'UPCOMING' },
        { sportId: football.id, league: 'Premier League', home: 'MCI', away: 'MUN', venue: emirates, startTime: hoursFromNow(-96), status: 'FINISHED' },
        // La Liga
        { sportId: football.id, league: 'La Liga', home: 'RMA', away: 'BAR', venue: bernabeu, startTime: hoursFromNow(48), status: 'UPCOMING', soldOut: true },
        { sportId: football.id, league: 'La Liga', home: 'ATM', away: 'RMA', venue: bernabeu, startTime: hoursFromNow(216), status: 'UPCOMING' },
        // IPL
        { sportId: cricket.id, league: 'IPL', home: 'MI', away: 'CSK', venue: wankhede, startTime: hoursFromNow(24), status: 'UPCOMING', soldOut: true },
        { sportId: cricket.id, league: 'IPL', home: 'KKR', away: 'RCB', venue: edenGardens, startTime: hoursFromNow(168), status: 'UPCOMING' },
        { sportId: cricket.id, league: 'IPL', home: 'CSK', away: 'RCB', venue: wankhede, startTime: hoursFromNow(-72), status: 'FINISHED' },
        // International
        { sportId: cricket.id, league: 'International', home: 'IND', away: 'AUS', venue: wankhede, startTime: hoursFromNow(120), status: 'UPCOMING' },
        { sportId: cricket.id, league: 'International', home: 'ENG', away: 'RSA', venue: edenGardens, startTime: hoursFromNow(1.5), status: 'LIVE' },
        // NBA
        { sportId: basketball.id, league: 'NBA', home: 'LAL', away: 'BOS', venue: cryptoArena, startTime: hoursFromNow(96), status: 'UPCOMING' },
        { sportId: basketball.id, league: 'NBA', home: 'GSW', away: 'CHI', venue: cryptoArena, startTime: hoursFromNow(-12), status: 'FINISHED' },
        { sportId: basketball.id, league: 'NBA', home: 'BOS', away: 'MIA', venue: tdGarden, startTime: hoursFromNow(192), status: 'UPCOMING' },
        { sportId: basketball.id, league: 'NBA', home: 'MIA', away: 'PHX', venue: tdGarden, startTime: hoursFromNow(-24), status: 'FINISHED' },
    ]

    for (const seed of eventSeeds) {
        const homeTeamId = team(
            seed.sportId === football.id ? fb : seed.sportId === cricket.id ? cr : bb,
            seed.home
        )
        const awayTeamId = team(
            seed.sportId === football.id ? fb : seed.sportId === cricket.id ? cr : bb,
            seed.away
        )

        const event = await prisma.event.create({
            data: {
                sportId: seed.sportId,
                league: seed.league,
                homeTeamId,
                awayTeamId,
                venueId: seed.venue.id,
                startTime: seed.startTime,
                status: seed.status,
            },
        })

        for (const [index, section] of seed.venue.sections.entries()) {
            const price = index === 0 ? 45 : 120
            const eventSection = await prisma.eventSection.create({
                data: { eventId: event.id, sectionId: section.id, price },
            })

            const seatsData = []
            for (let row = 1; row <= section.rows; row++) {
                for (let number = 1; number <= section.seatsPerRow; number++) {
                    seatsData.push({
                        eventSectionId: eventSection.id,
                        row,
                        number,
                        status: seed.soldOut ? SeatStatus.SOLD : SeatStatus.AVAILABLE,
                    })
                }
            }
            await prisma.seat.createMany({ data: seatsData })
        }
    }

    const passwordHash = await bcrypt.hash('password123', 10)
    await prisma.user.create({
        data: {
            email: 'admin@matchday.dev',
            name: 'Admin',
            role: 'ADMIN',
            passwordHash,
        },
    })
    const fan = await prisma.user.create({
        data: {
            email: 'fan@matchday.dev',
            name: 'Sample Fan',
            role: 'USER',
            passwordHash,
        },
    })

    // Give the demo fan a couple of favorites so "Your Teams" has content
    // to show immediately.
    await prisma.favorite.createMany({
        data: [
            { userId: fan.id, teamId: team(fb, 'ARS') },
            { userId: fan.id, teamId: team(cr, 'MI') },
        ],
    })

    console.log(`Seed complete: ${eventSeeds.length} events, ${fb.size + cr.size + bb.size} teams, 6 venues.`)
}

main()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
