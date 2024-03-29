export interface Contest {
	id: string;
	name: string;
}

export interface Edition {
	edition: string;
	edval: number;
	entries: number;
	hostcities: string[];
    hostcountries: string[];
	hostusers: string[];
	phases: Phase[];
	slogan: string;
	aqnum: number; //Number of Automatic Qualifiers (usually 6 in eds. with semi-finals)
	pots?: Pot[];
}

export interface Phase {
	name: string; //Name in singular form
	plural: string; //Name in plural form
	cv: boolean; //Whether or not there's crossvoting in that phase
	cvscaling?: boolean; //Whether or not the crossvotes are scaled
	num: number; //Number of that phase (ex. 3 semi-finals, 1 grand final)
}

export interface Pot {
	name: string; //Typically a number or 'N' for Newcomers
	members: string[]; //Users in the pot
}

export interface Song {
	artist?: string;
	country: string;
	draws?: Draw[];
	dqphase?: number;
	dqreason?: string;
	edition: string;
	edval: number;
	features?: string[]; //Featured artists
	language?: string;
	participant?: boolean; //Whether that user sent a song (true) or just voted (false)
	phases: number;
	pointsets: Pointsets[];
	song?: string;
	user: string;
	winner?: boolean;
}

export interface Draw {
	ro?: number;
	num?: number; //Which number final they're in (Semi-final 1, Quarter-final 5, etc.)
	place?: number;
	points?: number;
	intpoints?: number;
	extpoints?: number; //External points (from cross-voting)
	rawextpoints?: number; // external points without scaling
	qualifier?: string; //'Q', 'NQ', 'XAQ' or 'AQ' for SFs, 'FAQ' or 'NAQ' for F
						//Q = Qualifier, NQ = Non-qualifer, XAQ = Extra AQ, 
						//AQ = Automaitc Qualifier, FAQ = Final AQ, NAQ = Non-AQ
}

interface Pointset {
	cv: boolean; //Whether the votes were external (cross-vote) or not
	points: string[]; //Lists the countries the user gave points to (1-8, 10, 12)
}

export interface Pointsets {
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

export interface HostEdition {
	ednum: number,
	stage: string,
	phase: string,
	format: string,
	users: string[],
	countries: string[]
}