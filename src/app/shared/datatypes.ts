export interface Contest {
	id: string;
	name: string;
}

export interface Edition {
	edition: string;
	edval: number;
	entries: number;
    hostcountries: string[];
	hostusers: string[];
	phases: Phase[];
	slogan: string;
	aqnum: number; //Number of Automatic Qualifiers (usually 6 in eds. with semi-finals)
}

export interface OldSong {
	artist: string;
	country: string;
	disqualified: string;
	edition: string;
	edval: number;
	extpoints: number;
	fpointset: {
		cv: boolean;
		points: string[];
	};
	fplace: number;
	fpoints: number;
	fro: number;
	intpoints: number;
	language: string;
	qualifier: string;
	rawextpoints: number;
	sf1pointset: {
		cv: boolean;
		points: string[10];
	};
	sf2pointset: {
		cv: boolean;
		points: string[10];
	};
	sf3pointset: {
		cv: boolean;
		points: string[10];
	};
	sfnum: string;
	sfplace: number;
	sfpoints: number;
	sfro: number;
	song: string;
	user: string;
}

export interface Phase {
	name: string; //Name in singular form
	plural: string; //Name in plural form
	cv: boolean; //Whether or not there's crossvoting in that phase
	num: number; //Number of that phase (ex. 3 semi-finals, 1 grand final)
}

export interface Song {
	artist: string;
	country: string;
	draws: Draw[];
	dqphase: number;
	dqreason?: string;
	edition: string;
	edval: number;
	language: string;
	phases: number;
	pointsets: Pointsets[];
	song: string;
	user: string;
}

export interface Draw {
	ro: number;
	num?: number; //Which number final they're in (Semi-final 1, Quarter-final 5, etc.)
	place?: number;
	points?: number;
	intpoints?: number;
	extpoints?: number; //External points (from cross-voting)
	rawextpoints?: number; // external points without scaling
	qualifier?: string; //'Q', 'NQ', or 'AQ' for SFs, 'FAQ' or 'NAQ' for F
}

interface Pointset {
	cv: boolean; //Whether the votes were external (cross-vote) or not
	points: string[]; //Lists the countries the user gave points to (1-8, 10, 12)
}

interface Pointsets {
	1?: Pointset;
	2?: Pointset;
	3?: Pointset;
	4?: Pointset;
	5?: Pointset;
	6?: Pointset;
	7?: Pointset;
	8?: Pointset;
	9?: Pointset;
	10?: Pointset;
	11?: Pointset;
	12?: Pointset;
}