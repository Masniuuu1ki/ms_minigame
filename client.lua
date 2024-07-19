local isMinigameActive = false
local success = false

function startGame()
    if isMinigameActive then return nil end

    isMinigameActive = true
    success = false

    SetNuiFocus(true, true)
    SendNUIMessage({ action = "startMinigame" })

    local promise = promise.new()

    RegisterNUICallback('minigameResult', function(data, cb)
        success = data.success
        isMinigameActive = false
        cb('ok')
        promise:resolve(success)
        SetNuiFocus(false, false)
    end)

    return Citizen.Await(promise)
end

exports('startGame', startGame)

RegisterCommand('testGame', function()
    local result = exports['ms_minigame']:startGame()
    if result then
        print('Completed')
    else
        print('Failed')
    end
end)
