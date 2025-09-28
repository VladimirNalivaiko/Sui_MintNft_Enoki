module nft_factory::nft_factory {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use sui::table::{Self, Table};
    use std::vector;
    use sui::display;
    use sui::package;

    // === ERROR CODES ===
    const EInvalidName: u64 = 0;
    const EInvalidDescription: u64 = 1;
    const EMaximumCapacityReached: u64 = 2;

    // === ONE-TIME WITNESS ===
    struct NFT_FACTORY has drop {}

    // === MAIN STRUCTURES ===
    
    // Global state for tracking all collections
    struct GlobalState has key {
        id: UID,
        collections: Table<ID, CollectionInfo>,
        collection_count: u64,
        // Counter for generating unique edition numbers
        global_edition_counter: u64,
    }

    // Collection information
    struct CollectionInfo has store, copy, drop {
        collection_id: ID,
        counter_id: ID,
        name: String,
        description: String,
        image_url: String,
        max_supply: Option<u64>,
        creator: address,
        created_at: u64,
        current_edition: u64, // Current edition number
    }

    // Collection (immutable data)
    struct Collection has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        max_supply: Option<u64>,
        creator: address,
        created_at: u64,
    }

    // Mint counter for collection
    struct MintCounter has key, store {
        id: UID,
        collection_id: ID,
        current_count: u64,
        max_supply: Option<u64>,
        owner: address,
    }

    // NFT with full metadata for wallet display
    struct NFT has key, store {
        id: UID,
        collection_id: ID,
        edition_number: u64,    // Edition number in collection
        minted_at: u64,
        owner: address,
        // Metadata for wallet display
        name: String,
        description: String,
        image_url: String,
        // Additional fields for wallet compatibility
        symbol: String,
        uri: String,
    }

    // === EVENTS ===
    
    // FIXED event for collections - added missing fields
    struct CollectionCreated has copy, drop {
        collection_id: ID,
        name: String,
        description: String,        // ADDED
        image_url: String,          // ADDED
        max_supply: Option<u64>,    // ADDED
        creator: address,
        created_at: u64,
    }

    // FIXED event for NFT - nft_id already present
    struct NFTCreated has copy, drop {
        nft_id: ID,
        collection_id: ID,
        edition_number: u64,
        minter: address,
        minted_at: u64,
    }

    // NEW event for mint counters
    struct MintCounterCreated has copy, drop {
        counter_id: ID,
        collection_id: ID,
        owner: address,
        max_supply: Option<u64>,
        created_at: u64,
    }

    // === MAIN FUNCTIONS ===

    // Initialization
    fun init(otw: NFT_FACTORY, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        
        let global_state = GlobalState {
            id: object::new(ctx),
            collections: table::new(ctx),
            collection_count: 0,
            global_edition_counter: 0,
        };
        
        // Create Display for NFT
        let nft_keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"project_url"),
            string::utf8(b"creator"),
            string::utf8(b"link"),
            string::utf8(b"collection"),
            string::utf8(b"attributes")
        ];
        let nft_values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{image_url}"),
            string::utf8(b"https://nft-factory.com"),
            string::utf8(b"NFT Factory"),
            string::utf8(b"https://nft-factory.com/nft/{id}"),
            string::utf8(b"{collection_id}"),
            string::utf8(b"Edition #{edition_number}")
        ];
        let nft_display = display::new_with_fields<NFT>(&publisher, nft_keys, nft_values, ctx);
        display::update_version(&mut nft_display);
        transfer::public_transfer(nft_display, tx_context::sender(ctx));
        
        // Create Display for Collection
        let collection_keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"project_url"),
            string::utf8(b"creator"),
            string::utf8(b"type"),
            string::utf8(b"supply"),
            string::utf8(b"max_supply")
        ];
        let collection_values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{image_url}"),
            string::utf8(b"https://nft-factory.com"),
            string::utf8(b"NFT Factory"),
            string::utf8(b"NFT Collection"),
            string::utf8(b"0"),
            string::utf8(b"{max_supply}")
        ];
        let collection_display = display::new_with_fields<Collection>(&publisher, collection_keys, collection_values, ctx);
        display::update_version(&mut collection_display);
        transfer::public_transfer(collection_display, tx_context::sender(ctx));
        
        // Burn Publisher
        package::burn_publisher(publisher);
        
        transfer::share_object(global_state);
    }

    // Create new collection
    public entry fun create_collection(
        global_state: &mut GlobalState,
        name: String,
        description: String,
        image_url: String,
        max_supply: Option<u64>,
        ctx: &mut TxContext
    ) {
        // Validation
        assert!(string::length(&name) > 0, EInvalidName);
        assert!(string::length(&description) > 0, EInvalidDescription);
        
        let creator = tx_context::sender(ctx);
        let current_time = tx_context::epoch_timestamp_ms(ctx);
        
        // Create collection
        let collection_id = object::new(ctx);
        let collection_id_copy = object::uid_to_inner(&collection_id);
        let collection = Collection {
            id: collection_id,
            name: name,
            description: description,
            image_url: image_url,
            max_supply: max_supply,
            creator: creator,
            created_at: current_time,
        };


        // Create mint counter
        let counter_id = object::new(ctx);
        let counter_id_copy = object::uid_to_inner(&counter_id);
        let mint_counter = MintCounter {
            id: counter_id,
            collection_id: collection_id_copy,
            current_count: 0,
            max_supply: max_supply,
            owner: creator,
        };

        // Create collection information
        let collection_info = CollectionInfo {
            collection_id: collection_id_copy,
            counter_id: counter_id_copy,
            name: name,
            description: description,
            image_url: image_url,
            max_supply: max_supply,
            creator: creator,
            created_at: current_time,
            current_edition: 0,
        };

        // Update global state
        table::add(&mut global_state.collections, collection_id_copy, collection_info);
        global_state.collection_count = global_state.collection_count + 1;

        // Emit FULL event for collection
        event::emit(CollectionCreated {
            collection_id: collection_id_copy,
            name: name,
            description: description,        // ADDED
            image_url: image_url,            // ADDED
            max_supply: max_supply,          // ADDED
            creator: creator,
            created_at: current_time,
        });
        
        // Emit event for counter (NEW!)
        event::emit(MintCounterCreated {
            counter_id: counter_id_copy,
            collection_id: collection_id_copy,
            owner: creator,
            max_supply: max_supply,
            created_at: current_time,
        });

        // Transfer objects
        transfer::public_transfer(collection, creator);
        transfer::share_object(mint_counter);
    }

    // MINTING with metadata for wallet display
    public entry fun mint_edition(
        global_state: &mut GlobalState,
        counter: &mut MintCounter,
        name: String,
        description: String,
        image_url: String,
        symbol: String,
        ctx: &mut TxContext
    ) {
        // Check limits
        if (option::is_some(&counter.max_supply)) {
            let max_supply = option::extract(&mut counter.max_supply);
            assert!(counter.current_count < max_supply, EMaximumCapacityReached);
            option::fill(&mut counter.max_supply, max_supply);
        };

        // Increment counters
        counter.current_count = counter.current_count + 1;
        global_state.global_edition_counter = global_state.global_edition_counter + 1;
        
        let edition_number = counter.current_count;
        let current_time = tx_context::epoch_timestamp_ms(ctx);
        let minter = tx_context::sender(ctx);

        // Create NFT with metadata
        let nft_id = object::new(ctx);
        let nft_id_copy = object::uid_to_inner(&nft_id);
        let nft = NFT {
            id: nft_id,
            collection_id: counter.collection_id,
            edition_number: edition_number,
            minted_at: current_time,
            owner: minter,
            name: name,
            description: description,
            image_url: image_url,
            symbol: symbol,
            uri: image_url, // Use image_url as uri
        };



        // Update collection information
        let collection_info = table::borrow_mut(&mut global_state.collections, counter.collection_id);
        collection_info.current_edition = edition_number;

        // Emit event
        event::emit(NFTCreated {
            nft_id: nft_id_copy,
            collection_id: counter.collection_id,
            edition_number: edition_number,
            minter: minter,
            minted_at: current_time,
        });

        // Transfer NFT
        transfer::public_transfer(nft, minter);
    }

    // === HELPER FUNCTIONS ===

    // Get collection by ID
    public fun get_collection_by_id(global_state: &GlobalState, collection_id: ID): Option<CollectionInfo> {
        if (table::contains(&global_state.collections, collection_id)) {
            let collection_info = table::borrow(&global_state.collections, collection_id);
            option::some(*collection_info)
        } else {
            option::none()
        }
    }

    // Get collection information
    public fun get_collection_info(collection: &Collection): (String, String, String, Option<u64>, address, u64) {
        (
            collection.name,
            collection.description,
            collection.image_url,
            collection.max_supply,
            collection.creator,
            collection.created_at,
        )
    }

    // Get counter information
    public fun get_mint_counter_info(counter: &MintCounter): (u64, Option<u64>, address, ID) {
        (
            counter.current_count,
            counter.max_supply,
            counter.owner,
            counter.collection_id,
        )
    }

    // Get NFT information
    public fun get_nft_info(nft: &NFT): (ID, u64, u64, address, String, String, String, String, String) {
        (
            nft.collection_id,
            nft.edition_number,
            nft.minted_at,
            nft.owner,
            nft.name,
            nft.description,
            nft.image_url,
            nft.symbol,
            nft.uri,
        )
    }

    // Get collection count
    public fun get_collection_count(global_state: &GlobalState): u64 {
        global_state.collection_count
    }

    // Get all collections (returns vector of collection IDs)
    // Note: Current Sui Table version does not support key iteration
    // This function will be implemented later or through events
    public fun get_all_collection_ids(global_state: &GlobalState): vector<ID> {
        // For now return empty vector
        // In future collection IDs can be obtained through events
        vector::empty<ID>()
    }

    // Get collection information by ID (public function)
    public fun get_collection_info_by_id(global_state: &GlobalState, collection_id: ID): Option<CollectionInfo> {
        get_collection_by_id(global_state, collection_id)
    }

    // Check collection existence
    public fun collection_exists(global_state: &GlobalState, collection_id: ID): bool {
        table::contains(&global_state.collections, collection_id)
    }

    // Get current collection edition number
    public fun get_current_edition(global_state: &GlobalState, collection_id: ID): Option<u64> {
        if (table::contains(&global_state.collections, collection_id)) {
            let collection_info = table::borrow(&global_state.collections, collection_id);
            option::some(collection_info.current_edition)
        } else {
            option::none()
        }
    }

    // Get global edition counter
    public fun get_global_edition_counter(global_state: &GlobalState): u64 {
        global_state.global_edition_counter
    }
}
