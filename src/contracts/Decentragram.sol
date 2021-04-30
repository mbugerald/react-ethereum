pragma solidity ^0.5.0;

contract Decentragram {

    string public name = "Decentragram";

    uint public imageCount = 0;

    struct Image {
        uint id;
        string hash;
        string description;
        uint tipAmount;
        address payable author;
    }

    event ImageCreated(
        uint id,
        string hash,
        string description,
        uint tipAmount,
        address payable author
    );

    event ImageTipped(
        uint id,
        string hash,
        string description,
        uint tipAmount,
        address payable author
    );

    // Store images
    mapping(uint => Image) public images;

    function uploadImage(string memory _imageHash, string memory _description) public {

        require(bytes(_imageHash).length > 0);
        require(bytes(_description).length > 0);
        require(msg.sender != address(0x0));

        imageCount++;

        // msg is global variable for ethereum from meta data and sender is the ethereum address of person calling the function.
        images[imageCount] = Image(1, _imageHash, _description, 0, msg.sender);

        // Trigger event
        emit ImageCreated(imageCount, _imageHash, _description, 0, msg.sender);

    }

    function tipImageOwner(uint _id) public payable {

        require(_id > 0 && _id <= imageCount);
        // Fetch image from storage
        Image memory  _image = images[_id];
        // Fetch the author
        address payable _author = _image.author;

        // msg.value is the amount of crypto currency sent in.
        // Pay the author by sending them ether.
        _author.transfer(msg.value);

        _image.tipAmount = _image.tipAmount + msg.value;

        emit ImageTipped(_id, _image.hash, _image.description, _image.tipAmount, _author);
    }
}
