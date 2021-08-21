export interface Contest {
	id: string;
	name: string;
}

export interface Edition {
	crossvoting: boolean;
	edition: string;
	edval: number;
	entries: number;
    hostcountries: string[];
	hostusers: string[];
	slogan: string;
}

export interface Song {
	artist: string;
	country: string;
	disqualified: string;
	edition: string;
	edval: number;
	extpoints: number;
	fpointset: {
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