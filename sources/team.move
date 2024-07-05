module team_addr::team_cricket {
    use std::signer;
    use std::vector;
    use std::string::String;
    use aptos_framework::aptos_account;

    /// Team list does not exist
    const E_TEAM_DOES_NOT_EXIST: u64 = 1;
    /// Try to create another team, but each user can only have one team
    const E_EACH_USER_CAN_ONLY_HAVE_ONE_TEAM: u64 = 2;
    /// member does not exist
    const E_TEAM_MEMBER_DOES_NOT_EXIST: u64 = 3;


    struct Match has key{
        organiser: address,
        team_one: address,
        team_two: address,
    }

    struct Bet has key{
        owner: address,
        team_idx: u64,
        amount: u64
    }

    struct TeamList has key, store {
        owner: address,
        members: vector<TeamMember>,
    }

    struct TeamMember has store, drop, copy {
        name: String,
        rank: u8,
        player_role: String,
        jersey_number: u8,
        batting_style: String,
        bowling_style: String,
    }

    // This function is only called once when the module is published for the first time.
    // init_module is optional, you can also have an entry function as the initializer.
    fun init_module(_module_publisher: &signer) {
        // nothing to do here
    }

    // ======================== Write functions ========================

    public entry fun create_team(sender: &signer) {
        let sender_address = signer::address_of(sender);
        assert!(
            !exists<TeamList>(sender_address),
            E_EACH_USER_CAN_ONLY_HAVE_ONE_TEAM
        );
        let team_list = TeamList {
            owner: sender_address,
            members: vector::empty(),
        };
        // store the Team resource directly under the sender
        move_to(sender, team_list);
    }

    public entry fun create_team_member(sender: &signer, name: String, rank: u8, player_role: String, jersey_number: u8, batting_style: String, bowling_style: String) acquires TeamList {
        let sender_address = signer::address_of(sender);
        assert_user_has_team_list(sender_address);
        let team_list = borrow_global_mut<TeamList>(sender_address);
        let new_team = TeamMember {
            name,
            rank,
            player_role,
            jersey_number,
            batting_style,
            bowling_style
        };
        vector::push_back(&mut team_list.members, new_team);
    }

    public entry fun create_match(sender: &signer, team_one_addr: address, team_two_addr: address){
        let sender_address = signer::address_of(sender);

        let new_match = Match{
            organiser: sender_address,
            team_one: team_one_addr,
            team_two: team_two_addr,
        };
        move_to(sender, new_match);
    }

//place a single bet
    public entry fun place_bet(sender: &signer, organiser: address, amount: u64, team_idx: u64) {
        let bet = Bet{
            owner: signer::address_of(sender),
            team_idx: team_idx,
            amount: amount
        };
        move_to(sender, bet);
        aptos_account::transfer(sender, organiser, amount);
    }

    // can be called by organiser
    #[randomness]
    entry fun fight_match(sender: &signer, betting_addr: address) acquires Bet{
        let winner_idx = aptos_framework::randomness::u64_range(0, 2);
        let bet = borrow_global_mut<Bet>(betting_addr);

        if(bet.team_idx == winner_idx){
            aptos_account::transfer(sender, betting_addr, bet.amount*2)
        }
    }

    // ======================== Read Functions ========================

    #[view]
    public fun has_team_list(sender: address): bool {
        exists<TeamList>(sender)
    }

    #[view]
    public fun get_team_list(sender: address): (address, u64) acquires TeamList {
        assert_user_has_team_list(sender);
        let team_list = borrow_global<TeamList>(sender);
        (team_list.owner, vector::length(&team_list.members))
    }

    #[view]
    public fun get_match(sender: address): (address, address, address) acquires Match {
        assert_user_has_team_list(sender);
        let match = borrow_global<Match>(sender);
        (match.organiser, match.team_one, match.team_two)
    }

    #[view]
    public fun get_bet(sender: address): (address, u64, u64) acquires Bet {
        assert_user_has_team_list(sender);
        let bet = borrow_global<Bet>(sender);
        (bet.owner, bet.team_idx, bet.amount)
    }

    #[view]
    public fun get_team_member(sender: address, member_idx: u64): (String, u8, u8, String) acquires TeamList {
        assert_user_has_team_list(sender);
        let team_list = borrow_global<TeamList>(sender);
        assert!(member_idx < vector::length(&team_list.members), E_TEAM_DOES_NOT_EXIST);
        let team_member_record = vector::borrow(&team_list.members, member_idx);
        (team_member_record.name, team_member_record.jersey_number, team_member_record.rank, team_member_record.player_role)
    }

    // ======================== Helper Functions ========================

    fun assert_user_has_team_list(user_addr: address) {
        assert!(
            exists<TeamList>(user_addr),
            E_TEAM_DOES_NOT_EXIST
        );
    }

    fun assert_user_has_given_team(team_list: &TeamList, member_idx: u64) {
        assert!(
            member_idx < vector::length(&team_list.members),
            E_TEAM_MEMBER_DOES_NOT_EXIST
        );
    }

}